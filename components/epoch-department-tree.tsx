"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, MoreHorizontal, Pencil, Trash2 } from "@/components/icons"
import type { Department } from "@/lib/types/organization"
import { useAuth } from "@/lib/auth/context"

interface EpochDepartmentTreeProps {
  departments: Department[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onDepartmentsChange?: (departments: Department[]) => void
  orgId: string
  canEdit?: boolean
}

interface TreeNode extends Department {
  children: TreeNode[]
  isExpanded?: boolean
}

function buildTree(departments: Department[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  // Create nodes
  for (const dept of departments) {
    map.set(dept.id, { ...dept, children: [] })
  }

  // Build tree
  for (const dept of departments) {
    const node = map.get(dept.id)!
    if (dept.parentId === null) {
      roots.push(node)
    } else {
      const parent = map.get(dept.parentId)
      if (parent) {
        parent.children.push(node)
      }
    }
  }

  // Sort by order
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.order - b.order)
    for (const node of nodes) {
      sortNodes(node.children)
    }
  }
  sortNodes(roots)

  return roots
}

export function EpochDepartmentTree({
  departments,
  selectedId,
  onSelect,
  onDepartmentsChange,
  orgId,
  canEdit = true,
}: EpochDepartmentTreeProps) {
  const { userId } = useAuth()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(departments.map((d) => d.id)))
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [newDeptName, setNewDeptName] = useState("")
  const [newDeptParent, setNewDeptParent] = useState<string | null>(null)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const tree = buildTree(departments)

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  useEffect(() => {
    setExpandedIds(new Set(departments.map((d) => d.id)))
  }, [departments])

  const handleCreateDept = async () => {
    if (!userId) {
      setError("認証情報がありません")
      return
    }
    if (!newDeptName.trim()) {
      setError("部門名を入力してください")
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`/api/epoch/orgs/${orgId}/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          },
        body: JSON.stringify({
          name: newDeptName.trim(),
          parentId: newDeptParent,
        }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "部門の作成に失敗しました")
      }
      const data = (await response.json()) as { department: Department }
      if (data.department) {
        onDepartmentsChange?.([...departments, data.department])
      }
      setCreateDialogOpen(false)
      setNewDeptName("")
      setNewDeptParent(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "部門の作成に失敗しました"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditDept = async () => {
    if (!editingDept) return
    if (!userId) {
      setError("認証情報がありません")
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/epoch/orgs/${orgId}/departments/${editingDept.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            },
          body: JSON.stringify({
            name: editingDept.name,
            parentId: editingDept.parentId,
          }),
        }
      )
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "部門の更新に失敗しました")
      }
      const data = (await response.json()) as { department: Department }
      if (data.department) {
        onDepartmentsChange?.(
          departments.map((dept) => (dept.id === data.department.id ? data.department : dept))
        )
      }
      setEditDialogOpen(false)
      setEditingDept(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "部門の更新に失敗しました"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDept = async (dept: Department) => {
    if (!userId) {
      setError("認証情報がありません")
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/epoch/orgs/${orgId}/departments/${dept.id}`,
        {
          method: "DELETE",
          headers: undefined,
        }
      )
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "部門の削除に失敗しました")
      }
      onDepartmentsChange?.(departments.filter((item) => item.id !== dept.id))
      if (selectedId === dept.id) {
        onSelect(null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "部門の削除に失敗しました"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedIds.has(node.id)
    const isSelected = selectedId === node.id
    const hasChildren = node.children.length > 0

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
            isSelected ? "bg-secondary" : "hover:bg-secondary/50"
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (hasChildren) toggleExpand(node.id)
            }}
            className={`p-0.5 ${hasChildren ? "text-muted-foreground hover:text-foreground" : "invisible"}`}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>

          <div
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => onSelect(node.id === selectedId ? null : node.id)}
          >
            {isExpanded && hasChildren ? (
              <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className="text-sm text-foreground truncate">{node.name}</span>
          </div>

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-secondary rounded"
                >
                  <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem
                  onClick={() => {
                    setNewDeptParent(node.id)
                    setCreateDialogOpen(true)
                  }}
                  className="text-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  子部門を追加
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setEditingDept(node)
                    setEditDialogOpen(true)
                  }}
                  className="text-foreground"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteDept(node)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-0.5 group">
        {tree.map((node) => renderNode(node))}
      </div>

      {canEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setNewDeptParent(null)
            setCreateDialogOpen(true)
          }}
          disabled={isSubmitting}
          className="w-full mt-4 border-dashed border-border bg-transparent text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          部門を追加
        </Button>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">部門を追加</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              新しい部門を作成します。
              {newDeptParent && (
                <span className="block mt-1">
                  親部門: {departments.find((d) => d.id === newDeptParent)?.name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dept-name" className="text-foreground">部門名</Label>
              <Input
                id="dept-name"
                placeholder="営業部"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="bg-secondary border-border text-foreground"
              />
            </div>

            {!newDeptParent && (
              <div className="space-y-2">
                <Label htmlFor="dept-parent" className="text-foreground">親部門（任意）</Label>
                <Select value={newDeptParent || "none"} onValueChange={(v) => setNewDeptParent(v === "none" ? null : v)}>
                  <SelectTrigger className="bg-secondary border-border text-foreground">
                    <SelectValue placeholder="なし（ルート部門）" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="none" className="text-foreground">なし（ルート部門）</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="text-foreground">
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              className="border-border bg-transparent"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleCreateDept}
              disabled={!newDeptName || isSubmitting}
              className="bg-primary text-primary-foreground"
            >
              {isSubmitting ? "作成中..." : "作成"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">部門を編集</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-dept-name" className="text-foreground">部門名</Label>
              <Input
                id="edit-dept-name"
                value={editingDept?.name || ""}
                onChange={(e) => setEditingDept((prev) => prev ? { ...prev, name: e.target.value } : null)}
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-border bg-transparent"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleEditDept}
              disabled={!editingDept?.name || isSubmitting}
              className="bg-primary text-primary-foreground"
            >
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
