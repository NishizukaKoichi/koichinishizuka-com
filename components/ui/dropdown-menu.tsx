import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null)

function composeHandlers<T extends React.SyntheticEvent>(
  primary?: (event: T) => void,
  secondary?: (event: T) => void,
) {
  return (event: T) => {
    primary?.(event)
    if (!event.defaultPrevented) {
      secondary?.(event)
    }
  }
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onEscape)

    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onEscape)
    }
  }, [open])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownMenuTrigger({ asChild, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = React.useContext(DropdownContext)
  if (!context) return null

  const toggle = () => context.setOpen(!context.open)
  const { asChild: _ignored, ...triggerProps } = props as { asChild?: boolean }

  if (asChild && React.isValidElement(props.children)) {
    const child = props.children as React.ReactElement<{ onClick?: (event: React.MouseEvent<HTMLElement>) => void }>
    return React.cloneElement(child, {
      onClick: composeHandlers(child.props.onClick, () => toggle()),
    })
  }

  return (
    <button
      type="button"
      onClick={composeHandlers(triggerProps.onClick as ((e: React.MouseEvent<HTMLButtonElement>) => void) | undefined, () => toggle())}
      {...triggerProps}
    >
      {props.children}
    </button>
  )
}

export function DropdownMenuContent({ className, align = "end", ...props }: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }) {
  const context = React.useContext(DropdownContext)
  if (!context?.open) return null

  const alignClass =
    align === "start"
      ? "left-0"
      : align === "center"
        ? "left-1/2 -translate-x-1/2"
        : "right-0"

  return (
    <div
      className={cn(
        "absolute top-full z-50 mt-2 min-w-[8rem] rounded-md border border-border bg-card p-1 shadow-lg",
        alignClass,
        className,
      )}
      data-align={align}
      {...props}
    />
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
  const { asChild: _ignored, ...itemProps } = props as { asChild?: boolean }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault()
      return
    }
    onClick?.(event as React.MouseEvent<HTMLButtonElement>)
    context?.setOpen(false)
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (event: React.MouseEvent<HTMLElement>) => void
      className?: string
    }>

    return React.cloneElement(child, {
      onClick: composeHandlers(child.props.onClick, handleClick),
      className: cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-secondary",
        className,
        child.props.className,
      ),
      "aria-disabled": disabled || undefined,
      ...itemProps,
    })
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn("flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-secondary", className)}
      onClick={handleClick}
      {...itemProps}
    >
      {children}
    </button>
  )
}

export function DropdownMenuLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2 py-1 text-xs text-muted-foreground", className)} {...props} />
}

export function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("my-1 h-px bg-border", className)} {...props} />
}
