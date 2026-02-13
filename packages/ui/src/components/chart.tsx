"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@workspace/ui/lib/utils"

export type ChartConfigEntry = {
  label?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
} & (
  | { color?: string; theme?: never }
  | { color?: never; theme: Record<string, string> }
)

export type ChartConfig = { [k: string]: ChartConfigEntry }

type ChartContextProps = {
  config: ChartConfig
}

type TooltipPayloadItem = {
  name?: string
  dataKey?: string
  value?: unknown
  payload?: Record<string, unknown>
  color?: string
}

type LegendPayloadItem = {
  dataKey?: string
  payload?: { fill?: string }
  color?: string
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn("w-full", className)}
        data-chart={chartId}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) return undefined
  const p = payload as Record<string, unknown>
  const payloadPayload = p.payload as Record<string, unknown> | undefined
  let configLabelKey: string = key
  if (key in p && typeof p[key] === "string") {
    configLabelKey = p[key] as string
  } else if (payloadPayload?.[key] && typeof payloadPayload[key] === "string") {
    configLabelKey = payloadPayload[key] as string
  }
  return configLabelKey in config
    ? config[configLabelKey]
    : undefined
}

const ChartTooltip = RechartsPrimitive.Tooltip

type ChartTooltipContentProps = React.ComponentProps<"div"> & {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  labelFormatter?: (value: string, payload: TooltipPayloadItem[]) => React.ReactNode
  labelClassName?: string
  formatter?: (
    value: unknown,
    name: string,
    item: TooltipPayloadItem,
    index: number,
    payload: Record<string, unknown>
  ) => React.ReactNode
  color?: string
  nameKey?: string
  labelKey?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) return null
      const [item] = payload
      const key = `${labelKey || (item?.dataKey ?? item?.name ?? "value")}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? (config[label as keyof typeof config]?.label as string) || label
          : itemConfig?.label

      if (labelFormatter && payload.length) {
        return labelFormatter(value as string, payload)
      }
      if (!value) return null
      return <span className={labelClassName}>{String(value)}</span>
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

    if (!active || !payload?.length) return null

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "border-border bg-background overflow-hidden rounded-lg border px-2 py-1.5 shadow-md",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        {payload.map((item: TooltipPayloadItem, index: number) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key) as ChartConfigEntry | undefined
          const indicatorColor = color || (item.payload?.fill as string) || item.color

          return (
            <div
              key={String(key)}
              className="flex flex-wrap items-center gap-1.5 [&>svg]:size-3.5 [&>svg]:text-muted-foreground"
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload ?? {})
              ) : (
                <>
                  {itemConfig && "icon" in itemConfig && itemConfig.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <span
                        className="rounded-[2px] border-2 border-current"
                        style={{
                          backgroundColor: indicatorColor,
                          borderColor: indicatorColor,
                        }}
                      />
                    )
                  )}
                  <span className="font-medium">
                    {itemConfig?.label ?? item.name}
                  </span>
                  {item.value != null && (
                    <span className="text-muted-foreground">
                      {Number(item.value).toLocaleString()}
                    </span>
                  )}
                </>
              )}
            </div>
          )
        })}
        {nestLabel ? tooltipLabel : null}
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

type ChartLegendContentProps = React.ComponentProps<"div"> & {
  payload?: LegendPayloadItem[]
  verticalAlign?: "top" | "bottom"
  hideIcon?: boolean
  nameKey?: string
}

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  ChartLegendContentProps
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart()

  if (!payload?.length) return null

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "flex-col-reverse" : "flex-col",
        className
      )}
    >
      {payload.map((item: LegendPayloadItem) => {
        const key = `${nameKey || item.dataKey || "value"}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key) as ChartConfigEntry | undefined

        return (
          <div
            key={String(key)}
            className="flex items-center gap-1.5 [&>svg]:size-3.5 [&>svg]:text-muted-foreground"
          >
            {itemConfig && "icon" in itemConfig && itemConfig.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <span
                className="rounded-[2px] border-2 border-current"
                style={{
                  backgroundColor: item.payload?.fill ?? item.color,
                  borderColor: item.payload?.fill ?? item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}
