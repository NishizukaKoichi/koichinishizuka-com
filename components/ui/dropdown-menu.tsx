import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null)

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return <DropdownContext.Provider value={{ open, setOpen }}>{children}</DropdownContext.Provider>
}

export function DropdownMenuTrigger({ asChild, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = React.useContext(DropdownContext)
  if (!context) return null
  const handleClick = () => context.setOpen(!context.open)
  if (asChild && React.isValidElement(props.children)) {
    return React.cloneElement(props.children, { onClick: handleClick })
  }
  return (
    <button type="button" onClick={handleClick} {...props}>
      {props.children}
    </button>
  )
}

export function DropdownMenuContent({ className, align, ...props }: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }) {
  const context = React.useContext(DropdownContext)
  if (!context?.open) return null
  return (
    <div className={cn("relative z-50 mt-2 min-w-[8rem] rounded-md border border-border bg-card p-1 shadow-lg", className)} data-align={align} {...props} />
  )
}

export function DropdownMenuItem({
  className,
  asChild,
  onClick,
  disabled,
  type: _type,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = React.useContext(DropdownContext)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault()
      return
    }
    onClick?.(event as React.MouseEvent<HTMLButtonElement>)
    context?.setOpen(false)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      className: cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-secondary",
        className,
        children.props?.className
      ),
      "aria-disabled": disabled || undefined,
      ...props,
    })
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-secondary",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  )
}

export function DropdownMenuLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2 py-1 text-xs text-muted-foreground", className)} {...props} />
}

export function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("my-1 h-px bg-border", className)} {...props} />
}
