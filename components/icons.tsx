// Generated from lucide-react v0.454.0 (ISC)
import * as React from "react"
import { cn } from "@/lib/utils"

type IconNode = Array<[string, Record<string, string>]>

type IconProps = React.SVGProps<SVGSVGElement>

const defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const

function renderNodes(iconNode: IconNode) {
  return iconNode.map(([tag, attrs], index) => {
    const { key, ...rest } = attrs
    return React.createElement(tag, { ...rest, key: key ?? `${tag}-${index}` })
  })
}

function createIcon(name: string, iconNode: IconNode) {
  const Component = React.forwardRef<SVGSVGElement, IconProps>(({ className, ...props }, ref) => (
    <svg
      {...defaultAttributes}
      ref={ref}
      aria-hidden="true"
      data-icon={name}
      className={cn("h-4 w-4", className)}
      {...props}
    >
      {renderNodes(iconNode)}
    </svg>
  ))
  Component.displayName = name
  return Component
}
export const Activity = createIcon("Activity", [
  [
    "path",
    {
      "d": "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
      "key": "169zse"
    }
  ]
])

export const AlertCircle = createIcon("AlertCircle", [
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "10",
      "key": "1mglay"
    }
  ],
  [
    "line",
    {
      "x1": "12",
      "x2": "12",
      "y1": "8",
      "y2": "12",
      "key": "1pkeuh"
    }
  ],
  [
    "line",
    {
      "x1": "12",
      "x2": "12.01",
      "y1": "16",
      "y2": "16",
      "key": "4dfq90"
    }
  ]
])

export const AlertTriangle = createIcon("AlertTriangle", [
  [
    "path",
    {
      "d": "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      "key": "wmoenq"
    }
  ],
  [
    "path",
    {
      "d": "M12 9v4",
      "key": "juzpu7"
    }
  ],
  [
    "path",
    {
      "d": "M12 17h.01",
      "key": "p32p05"
    }
  ]
])

export const Apple = createIcon("Apple", [
  [
    "path",
    {
      "d": "M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z",
      "key": "3s7exb"
    }
  ],
  [
    "path",
    {
      "d": "M10 2c1 .5 2 2 2 5",
      "key": "fcco2y"
    }
  ]
])

export const ArrowDown = createIcon("ArrowDown", [
  [
    "path",
    {
      "d": "M12 5v14",
      "key": "s699le"
    }
  ],
  [
    "path",
    {
      "d": "m19 12-7 7-7-7",
      "key": "1idqje"
    }
  ]
])

export const ArrowLeft = createIcon("ArrowLeft", [
  [
    "path",
    {
      "d": "m12 19-7-7 7-7",
      "key": "1l729n"
    }
  ],
  [
    "path",
    {
      "d": "M19 12H5",
      "key": "x3x0zl"
    }
  ]
])

export const ArrowRight = createIcon("ArrowRight", [
  [
    "path",
    {
      "d": "M5 12h14",
      "key": "1ays0h"
    }
  ],
  [
    "path",
    {
      "d": "m12 5 7 7-7 7",
      "key": "xquz4c"
    }
  ]
])

export const ArrowUp = createIcon("ArrowUp", [
  [
    "path",
    {
      "d": "m5 12 7-7 7 7",
      "key": "hav0vg"
    }
  ],
  [
    "path",
    {
      "d": "M12 19V5",
      "key": "x0mq9r"
    }
  ]
])

export const Ban = createIcon("Ban", [
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "10",
      "key": "1mglay"
    }
  ],
  [
    "path",
    {
      "d": "m4.9 4.9 14.2 14.2",
      "key": "1m5liu"
    }
  ]
])

export const BarChart3 = createIcon("BarChart3", [
  [
    "path",
    {
      "d": "M3 3v16a2 2 0 0 0 2 2h16",
      "key": "c24i48"
    }
  ],
  [
    "path",
    {
      "d": "M18 17V9",
      "key": "2bz60n"
    }
  ],
  [
    "path",
    {
      "d": "M13 17V5",
      "key": "1frdt8"
    }
  ],
  [
    "path",
    {
      "d": "M8 17v-3",
      "key": "17ska0"
    }
  ]
])

export const Bell = createIcon("Bell", [
  [
    "path",
    {
      "d": "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",
      "key": "1qo2s2"
    }
  ],
  [
    "path",
    {
      "d": "M10.3 21a1.94 1.94 0 0 0 3.4 0",
      "key": "qgo35s"
    }
  ]
])

export const BookOpen = createIcon("BookOpen", [
  [
    "path",
    {
      "d": "M12 7v14",
      "key": "1akyts"
    }
  ],
  [
    "path",
    {
      "d": "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      "key": "ruj8y"
    }
  ]
])

export const Brain = createIcon("Brain", [
  [
    "path",
    {
      "d": "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",
      "key": "l5xja"
    }
  ],
  [
    "path",
    {
      "d": "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",
      "key": "ep3f8r"
    }
  ],
  [
    "path",
    {
      "d": "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4",
      "key": "1p4c4q"
    }
  ],
  [
    "path",
    {
      "d": "M17.599 6.5a3 3 0 0 0 .399-1.375",
      "key": "tmeiqw"
    }
  ],
  [
    "path",
    {
      "d": "M6.003 5.125A3 3 0 0 0 6.401 6.5",
      "key": "105sqy"
    }
  ],
  [
    "path",
    {
      "d": "M3.477 10.896a4 4 0 0 1 .585-.396",
      "key": "ql3yin"
    }
  ],
  [
    "path",
    {
      "d": "M19.938 10.5a4 4 0 0 1 .585.396",
      "key": "1qfode"
    }
  ],
  [
    "path",
    {
      "d": "M6 18a4 4 0 0 1-1.967-.516",
      "key": "2e4loj"
    }
  ],
  [
    "path",
    {
      "d": "M19.967 17.484A4 4 0 0 1 18 18",
      "key": "159ez6"
    }
  ]
])

export const Briefcase = createIcon("Briefcase", [
  [
    "path",
    {
      "d": "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
      "key": "jecpp"
    }
  ],
  [
    "rect",
    {
      "width": "20",
      "height": "14",
      "x": "2",
      "y": "6",
      "rx": "2",
      "key": "i6l2r4"
    }
  ]
])

export const Building = createIcon("Building", [
  [
    "rect",
    {
      "width": "16",
      "height": "20",
      "x": "4",
      "y": "2",
      "rx": "2",
      "ry": "2",
      "key": "76otgf"
    }
  ],
  [
    "path",
    {
      "d": "M9 22v-4h6v4",
      "key": "r93iot"
    }
  ],
  [
    "path",
    {
      "d": "M8 6h.01",
      "key": "1dz90k"
    }
  ],
  [
    "path",
    {
      "d": "M16 6h.01",
      "key": "1x0f13"
    }
  ],
  [
    "path",
    {
      "d": "M12 6h.01",
      "key": "1vi96p"
    }
  ],
  [
    "path",
    {
      "d": "M12 10h.01",
      "key": "1nrarc"
    }
  ],
  [
    "path",
    {
      "d": "M12 14h.01",
      "key": "1etili"
    }
  ],
  [
    "path",
    {
      "d": "M16 10h.01",
      "key": "1m94wz"
    }
  ],
  [
    "path",
    {
      "d": "M16 14h.01",
      "key": "1gbofw"
    }
  ],
  [
    "path",
    {
      "d": "M8 10h.01",
      "key": "19clt8"
    }
  ],
  [
    "path",
    {
      "d": "M8 14h.01",
      "key": "6423bh"
    }
  ]
])

export const Building2 = createIcon("Building2", [
  [
    "path",
    {
      "d": "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",
      "key": "1b4qmf"
    }
  ],
  [
    "path",
    {
      "d": "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",
      "key": "i71pzd"
    }
  ],
  [
    "path",
    {
      "d": "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",
      "key": "10jefs"
    }
  ],
  [
    "path",
    {
      "d": "M10 6h4",
      "key": "1itunk"
    }
  ],
  [
    "path",
    {
      "d": "M10 10h4",
      "key": "tcdvrf"
    }
  ],
  [
    "path",
    {
      "d": "M10 14h4",
      "key": "kelpxr"
    }
  ],
  [
    "path",
    {
      "d": "M10 18h4",
      "key": "1ulq68"
    }
  ]
])

export const Calendar = createIcon("Calendar", [
  [
    "path",
    {
      "d": "M8 2v4",
      "key": "1cmpym"
    }
  ],
  [
    "path",
    {
      "d": "M16 2v4",
      "key": "4m81vk"
    }
  ],
  [
    "rect",
    {
      "width": "18",
      "height": "18",
      "x": "3",
      "y": "4",
      "rx": "2",
      "key": "1hopcy"
    }
  ],
  [
    "path",
    {
      "d": "M3 10h18",
      "key": "8toen8"
    }
  ]
])

export const CalendarIcon = createIcon("CalendarIcon", [
  [
    "path",
    {
      "d": "M8 2v4",
      "key": "1cmpym"
    }
  ],
  [
    "path",
    {
      "d": "M16 2v4",
      "key": "4m81vk"
    }
  ],
  [
    "rect",
    {
      "width": "18",
      "height": "18",
      "x": "3",
      "y": "4",
      "rx": "2",
      "key": "1hopcy"
    }
  ],
  [
    "path",
    {
      "d": "M3 10h18",
      "key": "8toen8"
    }
  ]
])

export const Camera = createIcon("Camera", [
  [
    "path",
    {
      "d": "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
      "key": "1tc9qg"
    }
  ],
  [
    "circle",
    {
      "cx": "12",
      "cy": "13",
      "r": "3",
      "key": "1vg3eu"
    }
  ]
])

export const Check = createIcon("Check", [
  [
    "path",
    {
      "d": "M20 6 9 17l-5-5",
      "key": "1gmf2c"
    }
  ]
])

export const CheckCircle = createIcon("CheckCircle", [
  [
    "path",
    {
      "d": "M21.801 10A10 10 0 1 1 17 3.335",
      "key": "yps3ct"
    }
  ],
  [
    "path",
    {
      "d": "m9 11 3 3L22 4",
      "key": "1pflzl"
    }
  ]
])

export const CheckCircle2 = createIcon("CheckCircle2", [
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "10",
      "key": "1mglay"
    }
  ],
  [
    "path",
    {
      "d": "m9 12 2 2 4-4",
      "key": "dzmm74"
    }
  ]
])

export const ChevronDown = createIcon("ChevronDown", [
  [
    "path",
    {
      "d": "m6 9 6 6 6-6",
      "key": "qrunsl"
    }
  ]
])

export const ChevronLeft = createIcon("ChevronLeft", [
  [
    "path",
    {
      "d": "m15 18-6-6 6-6",
      "key": "1wnfg3"
    }
  ]
])

export const ChevronRight = createIcon("ChevronRight", [
  [
    "path",
    {
      "d": "m9 18 6-6-6-6",
      "key": "mthhwq"
    }
  ]
])

export const ChevronUp = createIcon("ChevronUp", [
  [
    "path",
    {
      "d": "m18 15-6-6-6 6",
      "key": "153udz"
    }
  ]
])

export const Chrome = createIcon("Chrome", [
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "10",
      "key": "1mglay"
    }
  ],
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "4",
      "key": "4exip2"
    }
  ],
  [
    "line",
    {
      "x1": "21.17",
      "x2": "12",
      "y1": "8",
      "y2": "8",
      "key": "a0cw5f"
    }
  ],
  [
    "line",
    {
      "x1": "3.95",
      "x2": "8.54",
      "y1": "6.06",
      "y2": "14",
      "key": "1kftof"
    }
  ],
  [
    "line",
    {
      "x1": "10.88",
      "x2": "15.46",
      "y1": "21.94",
      "y2": "14",
      "key": "1ymyh8"
    }
  ]
])

export const Circle = createIcon("Circle", [
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "10",
      "key": "1mglay"
    }
  ]
])

export const Clock = createIcon("Clock", [
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "10",
      "key": "1mglay"
    }
  ],
  [
    "polyline",
    {
      "points": "12 6 12 12 16 14",
      "key": "68esgv"
    }
  ]
])

export const Code = createIcon("Code", [
  [
    "polyline",
    {
      "points": "16 18 22 12 16 6",
      "key": "z7tu5w"
    }
  ],
  [
    "polyline",
    {
      "points": "8 6 2 12 8 18",
      "key": "1eg1df"
    }
  ]
])

export const Compass = createIcon("Compass", [
  [
    "path",
    {
      "d": "m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",
      "key": "9ktpf1"
    }
  ],
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "10",
      "key": "1mglay"
    }
  ]
])

export const Copy = createIcon("Copy", [
  [
    "rect",
    {
      "width": "14",
      "height": "14",
      "x": "8",
      "y": "8",
      "rx": "2",
      "ry": "2",
      "key": "17jyea"
    }
  ],
  [
    "path",
    {
      "d": "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
      "key": "zix9uf"
    }
  ]
])

export const Cpu = createIcon("Cpu", [
  [
    "rect",
    {
      "width": "16",
      "height": "16",
      "x": "4",
      "y": "4",
      "rx": "2",
      "key": "14l7u7"
    }
  ],
  [
    "rect",
    {
      "width": "6",
      "height": "6",
      "x": "9",
      "y": "9",
      "rx": "1",
      "key": "5aljv4"
    }
  ],
  [
    "path",
    {
      "d": "M15 2v2",
      "key": "13l42r"
    }
  ],
  [
    "path",
    {
      "d": "M15 20v2",
      "key": "15mkzm"
    }
  ],
  [
    "path",
    {
      "d": "M2 15h2",
      "key": "1gxd5l"
    }
  ],
  [
    "path",
    {
      "d": "M2 9h2",
      "key": "1bbxkp"
    }
  ],
  [
    "path",
    {
      "d": "M20 15h2",
      "key": "19e6y8"
    }
  ],
  [
    "path",
    {
      "d": "M20 9h2",
      "key": "19tzq7"
    }
  ],
  [
    "path",
    {
      "d": "M9 2v2",
      "key": "165o2o"
    }
  ],
  [
    "path",
    {
      "d": "M9 20v2",
      "key": "i2bqo8"
    }
  ]
])

export const CreditCard = createIcon("CreditCard", [
  [
    "rect",
    {
      "width": "20",
      "height": "14",
      "x": "2",
      "y": "5",
      "rx": "2",
      "key": "ynyp8z"
    }
  ],
  [
    "line",
    {
      "x1": "2",
      "x2": "22",
      "y1": "10",
      "y2": "10",
      "key": "1b3vmo"
    }
  ]
])

export const Database = createIcon("Database", [
  [
    "ellipse",
    {
      "cx": "12",
      "cy": "5",
      "rx": "9",
      "ry": "3",
      "key": "msslwz"
    }
  ],
  [
    "path",
    {
      "d": "M3 5V19A9 3 0 0 0 21 19V5",
      "key": "1wlel7"
    }
  ],
  [
    "path",
    {
      "d": "M3 12A9 3 0 0 0 21 12",
      "key": "mv7ke4"
    }
  ]
])

export const Download = createIcon("Download", [
  [
    "path",
    {
      "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
      "key": "ih7n3h"
    }
  ],
  [
    "polyline",
    {
      "points": "7 10 12 15 17 10",
      "key": "2ggqvy"
    }
  ],
  [
    "line",
    {
      "x1": "12",
      "x2": "12",
      "y1": "15",
      "y2": "3",
      "key": "1vk2je"
    }
  ]
])

export const Edit = createIcon("Edit", [
  [
    "path",
    {
      "d": "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
      "key": "1m0v6g"
    }
  ],
  [
    "path",
    {
      "d": "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
      "key": "ohrbg2"
    }
  ]
])

export const Edit2 = createIcon("Edit2", [
  [
    "path",
    {
      "d": "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      "key": "1a8usu"
    }
  ]
])

export const ExternalLink = createIcon("ExternalLink", [
  [
    "path",
    {
      "d": "M15 3h6v6",
      "key": "1q9fwt"
    }
  ],
  [
    "path",
    {
      "d": "M10 14 21 3",
      "key": "gplh6r"
    }
  ],
  [
    "path",
    {
      "d": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
      "key": "a6xqqp"
    }
  ]
])

export const Eye = createIcon("Eye", [
  [
    "path",
    {
      "d": "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      "key": "1nclc0"
    }
  ],
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "3",
      "key": "1v7zrd"
    }
  ]
])

export const EyeOff = createIcon("EyeOff", [
  [
    "path",
    {
      "d": "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
      "key": "ct8e1f"
    }
  ],
  [
    "path",
    {
      "d": "M14.084 14.158a3 3 0 0 1-4.242-4.242",
      "key": "151rxh"
    }
  ],
  [
    "path",
    {
      "d": "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
      "key": "13bj9a"
    }
  ],
  [
    "path",
    {
      "d": "m2 2 20 20",
      "key": "1ooewy"
    }
  ]
])

export const FileCheck = createIcon("FileCheck", [
  [
    "path",
    {
      "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
      "key": "1rqfz7"
    }
  ],
  [
    "path",
    {
      "d": "M14 2v4a2 2 0 0 0 2 2h4",
      "key": "tnqrlb"
    }
  ],
  [
    "path",
    {
      "d": "m9 15 2 2 4-4",
      "key": "1grp1n"
    }
  ]
])

export const FileJson = createIcon("FileJson", [
  [
    "path",
    {
      "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
      "key": "1rqfz7"
    }
  ],
  [
    "path",
    {
      "d": "M14 2v4a2 2 0 0 0 2 2h4",
      "key": "tnqrlb"
    }
  ],
  [
    "path",
    {
      "d": "M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1",
      "key": "1oajmo"
    }
  ],
  [
    "path",
    {
      "d": "M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1",
      "key": "mpwhp6"
    }
  ]
])

export const FileOutput = createIcon("FileOutput", [
  [
    "path",
    {
      "d": "M14 2v4a2 2 0 0 0 2 2h4",
      "key": "tnqrlb"
    }
  ],
  [
    "path",
    {
      "d": "M4 7V4a2 2 0 0 1 2-2 2 2 0 0 0-2 2",
      "key": "1vk7w2"
    }
  ],
  [
    "path",
    {
      "d": "M4.063 20.999a2 2 0 0 0 2 1L18 22a2 2 0 0 0 2-2V7l-5-5H6",
      "key": "1jink5"
    }
  ],
  [
    "path",
    {
      "d": "m5 11-3 3",
      "key": "1dgrs4"
    }
  ],
  [
    "path",
    {
      "d": "m5 17-3-3h10",
      "key": "1mvvaf"
    }
  ]
])

export const FileSignature = createIcon("FileSignature", [
  [
    "path",
    {
      "d": "m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2",
      "key": "142zxg"
    }
  ],
  [
    "path",
    {
      "d": "M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z",
      "key": "2t3380"
    }
  ],
  [
    "path",
    {
      "d": "M8 18h1",
      "key": "13wk12"
    }
  ]
])

export const FileText = createIcon("FileText", [
  [
    "path",
    {
      "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
      "key": "1rqfz7"
    }
  ],
  [
    "path",
    {
      "d": "M14 2v4a2 2 0 0 0 2 2h4",
      "key": "tnqrlb"
    }
  ],
  [
    "path",
    {
      "d": "M10 9H8",
      "key": "b1mrlr"
    }
  ],
  [
    "path",
    {
      "d": "M16 13H8",
      "key": "t4e002"
    }
  ],
  [
    "path",
    {
      "d": "M16 17H8",
      "key": "z1uh3a"
    }
  ]
])

export const FileX = createIcon("FileX", [
  [
    "path",
    {
      "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
      "key": "1rqfz7"
    }
  ],
  [
    "path",
    {
      "d": "M14 2v4a2 2 0 0 0 2 2h4",
      "key": "tnqrlb"
    }
  ],
  [
    "path",
    {
      "d": "m14.5 12.5-5 5",
      "key": "b62r18"
    }
  ],
  [
    "path",
    {
      "d": "m9.5 12.5 5 5",
      "key": "1rk7el"
    }
  ]
])

export const Filter = createIcon("Filter", [
  [
    "polygon",
    {
      "points": "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3",
      "key": "1yg77f"
    }
  ]
])

export const Fingerprint = createIcon("Fingerprint", [
  [
    "path",
    {
      "d": "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4",
      "key": "1nerag"
    }
  ],
  [
    "path",
    {
      "d": "M14 13.12c0 2.38 0 6.38-1 8.88",
      "key": "o46ks0"
    }
  ],
  [
    "path",
    {
      "d": "M17.29 21.02c.12-.6.43-2.3.5-3.02",
      "key": "ptglia"
    }
  ],
  [
    "path",
    {
      "d": "M2 12a10 10 0 0 1 18-6",
      "key": "ydlgp0"
    }
  ],
  [
    "path",
    {
      "d": "M2 16h.01",
      "key": "1gqxmh"
    }
  ],
  [
    "path",
    {
      "d": "M21.8 16c.2-2 .131-5.354 0-6",
      "key": "drycrb"
    }
  ],
  [
    "path",
    {
      "d": "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2",
      "key": "1tidbn"
    }
  ],
  [
    "path",
    {
      "d": "M8.65 22c.21-.66.45-1.32.57-2",
      "key": "13wd9y"
    }
  ],
  [
    "path",
    {
      "d": "M9 6.8a6 6 0 0 1 9 5.2v2",
      "key": "1fr1j5"
    }
  ]
])

export const Folder = createIcon("Folder", [
  [
    "path",
    {
      "d": "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      "key": "1kt360"
    }
  ]
])

export const FolderOpen = createIcon("FolderOpen", [
  [
    "path",
    {
      "d": "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
      "key": "usdka0"
    }
  ]
])

export const FolderTree = createIcon("FolderTree", [
  [
    "path",
    {
      "d": "M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",
      "key": "hod4my"
    }
  ],
  [
    "path",
    {
      "d": "M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",
      "key": "w4yl2u"
    }
  ],
  [
    "path",
    {
      "d": "M3 5a2 2 0 0 0 2 2h3",
      "key": "f2jnh7"
    }
  ],
  [
    "path",
    {
      "d": "M3 3v13a2 2 0 0 0 2 2h3",
      "key": "k8epm1"
    }
  ]
])

export const GitBranch = createIcon("GitBranch", [
  [
    "line",
    {
      "x1": "6",
      "x2": "6",
      "y1": "3",
      "y2": "15",
      "key": "17qcm7"
    }
  ],
  [
    "circle",
    {
      "cx": "18",
      "cy": "6",
      "r": "3",
      "key": "1h7g24"
    }
  ],
  [
    "circle",
    {
      "cx": "6",
      "cy": "18",
      "r": "3",
      "key": "fqmcym"
    }
  ],
  [
    "path",
    {
      "d": "M18 9a9 9 0 0 1-9 9",
      "key": "n2h4wq"
    }
  ]
])

export const Github = createIcon("Github", [
  [
    "path",
    {
      "d": "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",
      "key": "tonef"
    }
  ],
  [
    "path",
    {
      "d": "M9 18c-4.51 2-5-2-7-2",
      "key": "9comsn"
    }
  ]
])

export const Globe = createIcon("Globe", [
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "10",
      "key": "1mglay"
    }
  ],
  [
    "path",
    {
      "d": "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",
      "key": "13o1zl"
    }
  ],
  [
    "path",
    {
      "d": "M2 12h20",
      "key": "9i4pu4"
    }
  ]
])

export const Grid = createIcon("Grid", [
  [
    "rect",
    {
      "width": "18",
      "height": "18",
      "x": "3",
      "y": "3",
      "rx": "2",
      "key": "afitv7"
    }
  ],
  [
    "path",
    {
      "d": "M3 9h18",
      "key": "1pudct"
    }
  ],
  [
    "path",
    {
      "d": "M3 15h18",
      "key": "5xshup"
    }
  ],
  [
    "path",
    {
      "d": "M9 3v18",
      "key": "fh3hqa"
    }
  ],
  [
    "path",
    {
      "d": "M15 3v18",
      "key": "14nvp0"
    }
  ]
])

export const GripVertical = createIcon("GripVertical", [
  [
    "circle",
    {
      "cx": "9",
      "cy": "12",
      "r": "1",
      "key": "1vctgf"
    }
  ],
  [
    "circle",
    {
      "cx": "9",
      "cy": "5",
      "r": "1",
      "key": "hp0tcf"
    }
  ],
  [
    "circle",
    {
      "cx": "9",
      "cy": "19",
      "r": "1",
      "key": "fkjjf6"
    }
  ],
  [
    "circle",
    {
      "cx": "15",
      "cy": "12",
      "r": "1",
      "key": "1tmaij"
    }
  ],
  [
    "circle",
    {
      "cx": "15",
      "cy": "5",
      "r": "1",
      "key": "19l28e"
    }
  ],
  [
    "circle",
    {
      "cx": "15",
      "cy": "19",
      "r": "1",
      "key": "f4zoj3"
    }
  ]
])

export const Hash = createIcon("Hash", [
  [
    "line",
    {
      "x1": "4",
      "x2": "20",
      "y1": "9",
      "y2": "9",
      "key": "4lhtct"
    }
  ],
  [
    "line",
    {
      "x1": "4",
      "x2": "20",
      "y1": "15",
      "y2": "15",
      "key": "vyu0kd"
    }
  ],
  [
    "line",
    {
      "x1": "10",
      "x2": "8",
      "y1": "3",
      "y2": "21",
      "key": "1ggp8o"
    }
  ],
  [
    "line",
    {
      "x1": "16",
      "x2": "14",
      "y1": "3",
      "y2": "21",
      "key": "weycgp"
    }
  ]
])

export const HeartOff = createIcon("HeartOff", [
  [
    "line",
    {
      "x1": "2",
      "y1": "2",
      "x2": "22",
      "y2": "22",
      "key": "1w4vcy"
    }
  ],
  [
    "path",
    {
      "d": "M16.5 16.5 12 21l-7-7c-1.5-1.45-3-3.2-3-5.5a5.5 5.5 0 0 1 2.14-4.35",
      "key": "3mpagl"
    }
  ],
  [
    "path",
    {
      "d": "M8.76 3.1c1.15.22 2.13.78 3.24 1.9 1.5-1.5 2.74-2 4.5-2A5.5 5.5 0 0 1 22 8.5c0 2.12-1.3 3.78-2.67 5.17",
      "key": "1gh3v3"
    }
  ]
])

export const History = createIcon("History", [
  [
    "path",
    {
      "d": "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
      "key": "1357e3"
    }
  ],
  [
    "path",
    {
      "d": "M3 3v5h5",
      "key": "1xhq8a"
    }
  ],
  [
    "path",
    {
      "d": "M12 7v5l4 2",
      "key": "1fdv2h"
    }
  ]
])

export const ImageIcon = createIcon("ImageIcon", [
  [
    "rect",
    {
      "width": "18",
      "height": "18",
      "x": "3",
      "y": "3",
      "rx": "2",
      "ry": "2",
      "key": "1m3agn"
    }
  ],
  [
    "circle",
    {
      "cx": "9",
      "cy": "9",
      "r": "2",
      "key": "af1f0g"
    }
  ],
  [
    "path",
    {
      "d": "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",
      "key": "1xmnt7"
    }
  ]
])

export const Inbox = createIcon("Inbox", [
  [
    "polyline",
    {
      "points": "22 12 16 12 14 15 10 15 8 12 2 12",
      "key": "o97t9d"
    }
  ],
  [
    "path",
    {
      "d": "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
      "key": "oot6mr"
    }
  ]
])

export const Info = createIcon("Info", [
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "10",
      "key": "1mglay"
    }
  ],
  [
    "path",
    {
      "d": "M12 16v-4",
      "key": "1dtifu"
    }
  ],
  [
    "path",
    {
      "d": "M12 8h.01",
      "key": "e9boi3"
    }
  ]
])

export const Instagram = createIcon("Instagram", [
  [
    "rect",
    {
      "width": "20",
      "height": "20",
      "x": "2",
      "y": "2",
      "rx": "5",
      "ry": "5",
      "key": "2e1cvw"
    }
  ],
  [
    "path",
    {
      "d": "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",
      "key": "9exkf1"
    }
  ],
  [
    "line",
    {
      "x1": "17.5",
      "x2": "17.51",
      "y1": "6.5",
      "y2": "6.5",
      "key": "r4j83e"
    }
  ]
])

export const Key = createIcon("Key", [
  [
    "path",
    {
      "d": "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4",
      "key": "g0fldk"
    }
  ],
  [
    "path",
    {
      "d": "m21 2-9.6 9.6",
      "key": "1j0ho8"
    }
  ],
  [
    "circle",
    {
      "cx": "7.5",
      "cy": "15.5",
      "r": "5.5",
      "key": "yqb3hr"
    }
  ]
])

export const KeyRound = createIcon("KeyRound", [
  [
    "path",
    {
      "d": "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",
      "key": "1s6t7t"
    }
  ],
  [
    "circle",
    {
      "cx": "16.5",
      "cy": "7.5",
      "r": ".5",
      "fill": "currentColor",
      "key": "w0ekpg"
    }
  ]
])

export const LayoutDashboard = createIcon("LayoutDashboard", [
  [
    "rect",
    {
      "width": "7",
      "height": "9",
      "x": "3",
      "y": "3",
      "rx": "1",
      "key": "10lvy0"
    }
  ],
  [
    "rect",
    {
      "width": "7",
      "height": "5",
      "x": "14",
      "y": "3",
      "rx": "1",
      "key": "16une8"
    }
  ],
  [
    "rect",
    {
      "width": "7",
      "height": "9",
      "x": "14",
      "y": "12",
      "rx": "1",
      "key": "1hutg5"
    }
  ],
  [
    "rect",
    {
      "width": "7",
      "height": "5",
      "x": "3",
      "y": "16",
      "rx": "1",
      "key": "ldoo1y"
    }
  ]
])

export const LayoutGrid = createIcon("LayoutGrid", [
  [
    "rect",
    {
      "width": "7",
      "height": "7",
      "x": "3",
      "y": "3",
      "rx": "1",
      "key": "1g98yp"
    }
  ],
  [
    "rect",
    {
      "width": "7",
      "height": "7",
      "x": "14",
      "y": "3",
      "rx": "1",
      "key": "6d4xhi"
    }
  ],
  [
    "rect",
    {
      "width": "7",
      "height": "7",
      "x": "14",
      "y": "14",
      "rx": "1",
      "key": "nxv5o0"
    }
  ],
  [
    "rect",
    {
      "width": "7",
      "height": "7",
      "x": "3",
      "y": "14",
      "rx": "1",
      "key": "1bb6yr"
    }
  ]
])

export const Lightbulb = createIcon("Lightbulb", [
  [
    "path",
    {
      "d": "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
      "key": "1gvzjb"
    }
  ],
  [
    "path",
    {
      "d": "M9 18h6",
      "key": "x1upvd"
    }
  ],
  [
    "path",
    {
      "d": "M10 22h4",
      "key": "ceow96"
    }
  ]
])

export const Link = createIcon("Link", [
  [
    "path",
    {
      "d": "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
      "key": "1cjeqo"
    }
  ],
  [
    "path",
    {
      "d": "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
      "key": "19qd67"
    }
  ]
])

export const Link2 = createIcon("Link2", [
  [
    "path",
    {
      "d": "M9 17H7A5 5 0 0 1 7 7h2",
      "key": "8i5ue5"
    }
  ],
  [
    "path",
    {
      "d": "M15 7h2a5 5 0 1 1 0 10h-2",
      "key": "1b9ql8"
    }
  ],
  [
    "line",
    {
      "x1": "8",
      "x2": "16",
      "y1": "12",
      "y2": "12",
      "key": "1jonct"
    }
  ]
])

export const Linkedin = createIcon("Linkedin", [
  [
    "path",
    {
      "d": "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",
      "key": "c2jq9f"
    }
  ],
  [
    "rect",
    {
      "width": "4",
      "height": "12",
      "x": "2",
      "y": "9",
      "key": "mk3on5"
    }
  ],
  [
    "circle",
    {
      "cx": "4",
      "cy": "4",
      "r": "2",
      "key": "bt5ra8"
    }
  ]
])

export const List = createIcon("List", [
  [
    "path",
    {
      "d": "M3 12h.01",
      "key": "nlz23k"
    }
  ],
  [
    "path",
    {
      "d": "M3 18h.01",
      "key": "1tta3j"
    }
  ],
  [
    "path",
    {
      "d": "M3 6h.01",
      "key": "1rqtza"
    }
  ],
  [
    "path",
    {
      "d": "M8 12h13",
      "key": "1za7za"
    }
  ],
  [
    "path",
    {
      "d": "M8 18h13",
      "key": "1lx6n3"
    }
  ],
  [
    "path",
    {
      "d": "M8 6h13",
      "key": "ik3vkj"
    }
  ]
])

export const Loader2 = createIcon("Loader2", [
  [
    "path",
    {
      "d": "M21 12a9 9 0 1 1-6.219-8.56",
      "key": "13zald"
    }
  ]
])

export const Lock = createIcon("Lock", [
  [
    "rect",
    {
      "width": "18",
      "height": "11",
      "x": "3",
      "y": "11",
      "rx": "2",
      "ry": "2",
      "key": "1w4ew1"
    }
  ],
  [
    "path",
    {
      "d": "M7 11V7a5 5 0 0 1 10 0v4",
      "key": "fwvmzm"
    }
  ]
])

export const LogOut = createIcon("LogOut", [
  [
    "path",
    {
      "d": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
      "key": "1uf3rs"
    }
  ],
  [
    "polyline",
    {
      "points": "16 17 21 12 16 7",
      "key": "1gabdz"
    }
  ],
  [
    "line",
    {
      "x1": "21",
      "x2": "9",
      "y1": "12",
      "y2": "12",
      "key": "1uyos4"
    }
  ]
])

export const Mail = createIcon("Mail", [
  [
    "rect",
    {
      "width": "20",
      "height": "16",
      "x": "2",
      "y": "4",
      "rx": "2",
      "key": "18n3k1"
    }
  ],
  [
    "path",
    {
      "d": "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",
      "key": "1ocrg3"
    }
  ]
])

export const MapPin = createIcon("MapPin", [
  [
    "path",
    {
      "d": "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      "key": "1r0f0z"
    }
  ],
  [
    "circle",
    {
      "cx": "12",
      "cy": "10",
      "r": "3",
      "key": "ilqhr7"
    }
  ]
])

export const Menu = createIcon("Menu", [
  [
    "line",
    {
      "x1": "4",
      "x2": "20",
      "y1": "12",
      "y2": "12",
      "key": "1e0a9i"
    }
  ],
  [
    "line",
    {
      "x1": "4",
      "x2": "20",
      "y1": "6",
      "y2": "6",
      "key": "1owob3"
    }
  ],
  [
    "line",
    {
      "x1": "4",
      "x2": "20",
      "y1": "18",
      "y2": "18",
      "key": "yk5zj1"
    }
  ]
])

export const MessageSquare = createIcon("MessageSquare", [
  [
    "path",
    {
      "d": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
      "key": "1lielz"
    }
  ]
])

export const Minus = createIcon("Minus", [
  [
    "path",
    {
      "d": "M5 12h14",
      "key": "1ays0h"
    }
  ]
])

export const MoreHorizontal = createIcon("MoreHorizontal", [
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "1",
      "key": "41hilf"
    }
  ],
  [
    "circle",
    {
      "cx": "19",
      "cy": "12",
      "r": "1",
      "key": "1wjl8i"
    }
  ],
  [
    "circle",
    {
      "cx": "5",
      "cy": "12",
      "r": "1",
      "key": "1pcz8c"
    }
  ]
])

export const MoreVertical = createIcon("MoreVertical", [
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "1",
      "key": "41hilf"
    }
  ],
  [
    "circle",
    {
      "cx": "12",
      "cy": "5",
      "r": "1",
      "key": "gxeob9"
    }
  ],
  [
    "circle",
    {
      "cx": "12",
      "cy": "19",
      "r": "1",
      "key": "lyex9k"
    }
  ]
])

export const Pen = createIcon("Pen", [
  [
    "path",
    {
      "d": "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      "key": "1a8usu"
    }
  ]
])

export const PenLine = createIcon("PenLine", [
  [
    "path",
    {
      "d": "M12 20h9",
      "key": "t2du7b"
    }
  ],
  [
    "path",
    {
      "d": "M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",
      "key": "1ykcvy"
    }
  ]
])

export const Pencil = createIcon("Pencil", [
  [
    "path",
    {
      "d": "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      "key": "1a8usu"
    }
  ],
  [
    "path",
    {
      "d": "m15 5 4 4",
      "key": "1mk7zo"
    }
  ]
])

export const Phone = createIcon("Phone", [
  [
    "path",
    {
      "d": "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
      "key": "foiqr5"
    }
  ]
])

export const Plug = createIcon("Plug", [
  [
    "path",
    {
      "d": "M12 22v-5",
      "key": "1ega77"
    }
  ],
  [
    "path",
    {
      "d": "M9 8V2",
      "key": "14iosj"
    }
  ],
  [
    "path",
    {
      "d": "M15 8V2",
      "key": "18g5xt"
    }
  ],
  [
    "path",
    {
      "d": "M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z",
      "key": "osxo6l"
    }
  ]
])

export const Plus = createIcon("Plus", [
  [
    "path",
    {
      "d": "M5 12h14",
      "key": "1ays0h"
    }
  ],
  [
    "path",
    {
      "d": "M12 5v14",
      "key": "s699le"
    }
  ]
])

export const RefreshCw = createIcon("RefreshCw", [
  [
    "path",
    {
      "d": "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",
      "key": "v9h5vc"
    }
  ],
  [
    "path",
    {
      "d": "M21 3v5h-5",
      "key": "1q7to0"
    }
  ],
  [
    "path",
    {
      "d": "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
      "key": "3uifl3"
    }
  ],
  [
    "path",
    {
      "d": "M8 16H3v5",
      "key": "1cv678"
    }
  ]
])

export const Save = createIcon("Save", [
  [
    "path",
    {
      "d": "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      "key": "1c8476"
    }
  ],
  [
    "path",
    {
      "d": "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",
      "key": "1ydtos"
    }
  ],
  [
    "path",
    {
      "d": "M7 3v4a1 1 0 0 0 1 1h7",
      "key": "t51u73"
    }
  ]
])

export const Scale = createIcon("Scale", [
  [
    "path",
    {
      "d": "m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",
      "key": "7g6ntu"
    }
  ],
  [
    "path",
    {
      "d": "m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",
      "key": "ijws7r"
    }
  ],
  [
    "path",
    {
      "d": "M7 21h10",
      "key": "1b0cd5"
    }
  ],
  [
    "path",
    {
      "d": "M12 3v18",
      "key": "108xh3"
    }
  ],
  [
    "path",
    {
      "d": "M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2",
      "key": "3gwbw2"
    }
  ]
])

export const Search = createIcon("Search", [
  [
    "circle",
    {
      "cx": "11",
      "cy": "11",
      "r": "8",
      "key": "4ej97u"
    }
  ],
  [
    "path",
    {
      "d": "m21 21-4.3-4.3",
      "key": "1qie3q"
    }
  ]
])

export const Send = createIcon("Send", [
  [
    "path",
    {
      "d": "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      "key": "1ffxy3"
    }
  ],
  [
    "path",
    {
      "d": "m21.854 2.147-10.94 10.939",
      "key": "12cjpa"
    }
  ]
])

export const Server = createIcon("Server", [
  [
    "rect",
    {
      "width": "20",
      "height": "8",
      "x": "2",
      "y": "2",
      "rx": "2",
      "ry": "2",
      "key": "ngkwjq"
    }
  ],
  [
    "rect",
    {
      "width": "20",
      "height": "8",
      "x": "2",
      "y": "14",
      "rx": "2",
      "ry": "2",
      "key": "iecqi9"
    }
  ],
  [
    "line",
    {
      "x1": "6",
      "x2": "6.01",
      "y1": "6",
      "y2": "6",
      "key": "16zg32"
    }
  ],
  [
    "line",
    {
      "x1": "6",
      "x2": "6.01",
      "y1": "18",
      "y2": "18",
      "key": "nzw8ys"
    }
  ]
])

export const Settings = createIcon("Settings", [
  [
    "path",
    {
      "d": "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
      "key": "1qme2f"
    }
  ],
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "3",
      "key": "1v7zrd"
    }
  ]
])

export const Settings2 = createIcon("Settings2", [
  [
    "path",
    {
      "d": "M20 7h-9",
      "key": "3s1dr2"
    }
  ],
  [
    "path",
    {
      "d": "M14 17H5",
      "key": "gfn3mx"
    }
  ],
  [
    "circle",
    {
      "cx": "17",
      "cy": "17",
      "r": "3",
      "key": "18b49y"
    }
  ],
  [
    "circle",
    {
      "cx": "7",
      "cy": "7",
      "r": "3",
      "key": "dfmy0x"
    }
  ]
])

export const Shield = createIcon("Shield", [
  [
    "path",
    {
      "d": "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      "key": "oel41y"
    }
  ]
])

export const Smartphone = createIcon("Smartphone", [
  [
    "rect",
    {
      "width": "14",
      "height": "20",
      "x": "5",
      "y": "2",
      "rx": "2",
      "ry": "2",
      "key": "1yt0o3"
    }
  ],
  [
    "path",
    {
      "d": "M12 18h.01",
      "key": "mhygvu"
    }
  ]
])

export const Sparkles = createIcon("Sparkles", [
  [
    "path",
    {
      "d": "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      "key": "4pj2yx"
    }
  ],
  [
    "path",
    {
      "d": "M20 3v4",
      "key": "1olli1"
    }
  ],
  [
    "path",
    {
      "d": "M22 5h-4",
      "key": "1gvqau"
    }
  ],
  [
    "path",
    {
      "d": "M4 17v2",
      "key": "vumght"
    }
  ],
  [
    "path",
    {
      "d": "M5 18H3",
      "key": "zchphs"
    }
  ]
])

export const Target = createIcon("Target", [
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "10",
      "key": "1mglay"
    }
  ],
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "6",
      "key": "1vlfrh"
    }
  ],
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "2",
      "key": "1c9p78"
    }
  ]
])

export const ToggleLeft = createIcon("ToggleLeft", [
  [
    "rect",
    {
      "width": "20",
      "height": "12",
      "x": "2",
      "y": "6",
      "rx": "6",
      "ry": "6",
      "key": "f2vt7d"
    }
  ],
  [
    "circle",
    {
      "cx": "8",
      "cy": "12",
      "r": "2",
      "key": "1nvbw3"
    }
  ]
])

export const Trash2 = createIcon("Trash2", [
  [
    "path",
    {
      "d": "M3 6h18",
      "key": "d0wm0j"
    }
  ],
  [
    "path",
    {
      "d": "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",
      "key": "4alrt4"
    }
  ],
  [
    "path",
    {
      "d": "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
      "key": "v07s0e"
    }
  ],
  [
    "line",
    {
      "x1": "10",
      "x2": "10",
      "y1": "11",
      "y2": "17",
      "key": "1uufr5"
    }
  ],
  [
    "line",
    {
      "x1": "14",
      "x2": "14",
      "y1": "11",
      "y2": "17",
      "key": "xtxkd"
    }
  ]
])

export const TrendingDown = createIcon("TrendingDown", [
  [
    "polyline",
    {
      "points": "22 17 13.5 8.5 8.5 13.5 2 7",
      "key": "1r2t7k"
    }
  ],
  [
    "polyline",
    {
      "points": "16 17 22 17 22 11",
      "key": "11uiuu"
    }
  ]
])

export const TrendingUp = createIcon("TrendingUp", [
  [
    "polyline",
    {
      "points": "22 7 13.5 15.5 8.5 10.5 2 17",
      "key": "126l90"
    }
  ],
  [
    "polyline",
    {
      "points": "16 7 22 7 22 13",
      "key": "kwv8wd"
    }
  ]
])

export const Twitter = createIcon("Twitter", [
  [
    "path",
    {
      "d": "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
      "key": "pff0z6"
    }
  ]
])

export const User = createIcon("User", [
  [
    "path",
    {
      "d": "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",
      "key": "975kel"
    }
  ],
  [
    "circle",
    {
      "cx": "12",
      "cy": "7",
      "r": "4",
      "key": "17ys0d"
    }
  ]
])

export const UserMinus = createIcon("UserMinus", [
  [
    "path",
    {
      "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
      "key": "1yyitq"
    }
  ],
  [
    "circle",
    {
      "cx": "9",
      "cy": "7",
      "r": "4",
      "key": "nufk8"
    }
  ],
  [
    "line",
    {
      "x1": "22",
      "x2": "16",
      "y1": "11",
      "y2": "11",
      "key": "1shjgl"
    }
  ]
])

export const UserPlus = createIcon("UserPlus", [
  [
    "path",
    {
      "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
      "key": "1yyitq"
    }
  ],
  [
    "circle",
    {
      "cx": "9",
      "cy": "7",
      "r": "4",
      "key": "nufk8"
    }
  ],
  [
    "line",
    {
      "x1": "19",
      "x2": "19",
      "y1": "8",
      "y2": "14",
      "key": "1bvyxn"
    }
  ],
  [
    "line",
    {
      "x1": "22",
      "x2": "16",
      "y1": "11",
      "y2": "11",
      "key": "1shjgl"
    }
  ]
])

export const UserX = createIcon("UserX", [
  [
    "path",
    {
      "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
      "key": "1yyitq"
    }
  ],
  [
    "circle",
    {
      "cx": "9",
      "cy": "7",
      "r": "4",
      "key": "nufk8"
    }
  ],
  [
    "line",
    {
      "x1": "17",
      "x2": "22",
      "y1": "8",
      "y2": "13",
      "key": "3nzzx3"
    }
  ],
  [
    "line",
    {
      "x1": "22",
      "x2": "17",
      "y1": "8",
      "y2": "13",
      "key": "1swrse"
    }
  ]
])

export const Users = createIcon("Users", [
  [
    "path",
    {
      "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
      "key": "1yyitq"
    }
  ],
  [
    "circle",
    {
      "cx": "9",
      "cy": "7",
      "r": "4",
      "key": "nufk8"
    }
  ],
  [
    "path",
    {
      "d": "M22 21v-2a4 4 0 0 0-3-3.87",
      "key": "kshegd"
    }
  ],
  [
    "path",
    {
      "d": "M16 3.13a4 4 0 0 1 0 7.75",
      "key": "1da9ce"
    }
  ]
])

export const Webhook = createIcon("Webhook", [
  [
    "path",
    {
      "d": "M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2",
      "key": "q3hayz"
    }
  ],
  [
    "path",
    {
      "d": "m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06",
      "key": "1go1hn"
    }
  ],
  [
    "path",
    {
      "d": "m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8",
      "key": "qlwsc0"
    }
  ]
])

export const WifiOff = createIcon("WifiOff", [
  [
    "path",
    {
      "d": "M12 20h.01",
      "key": "zekei9"
    }
  ],
  [
    "path",
    {
      "d": "M8.5 16.429a5 5 0 0 1 7 0",
      "key": "1bycff"
    }
  ],
  [
    "path",
    {
      "d": "M5 12.859a10 10 0 0 1 5.17-2.69",
      "key": "1dl1wf"
    }
  ],
  [
    "path",
    {
      "d": "M19 12.859a10 10 0 0 0-2.007-1.523",
      "key": "4k23kn"
    }
  ],
  [
    "path",
    {
      "d": "M2 8.82a15 15 0 0 1 4.177-2.643",
      "key": "1grhjp"
    }
  ],
  [
    "path",
    {
      "d": "M22 8.82a15 15 0 0 0-11.288-3.764",
      "key": "z3jwby"
    }
  ],
  [
    "path",
    {
      "d": "m2 2 20 20",
      "key": "1ooewy"
    }
  ]
])

export const X = createIcon("X", [
  [
    "path",
    {
      "d": "M18 6 6 18",
      "key": "1bl5f8"
    }
  ],
  [
    "path",
    {
      "d": "m6 6 12 12",
      "key": "d8bk6v"
    }
  ]
])

export const XCircle = createIcon("XCircle", [
  [
    "circle",
    {
      "cx": "12",
      "cy": "12",
      "r": "10",
      "key": "1mglay"
    }
  ],
  [
    "path",
    {
      "d": "m15 9-6 6",
      "key": "1uzhvr"
    }
  ],
  [
    "path",
    {
      "d": "m9 9 6 6",
      "key": "z0biqf"
    }
  ]
])

export const Youtube = createIcon("Youtube", [
  [
    "path",
    {
      "d": "M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17",
      "key": "1q2vi4"
    }
  ],
  [
    "path",
    {
      "d": "m10 15 5-3-5-3z",
      "key": "1jp15x"
    }
  ]
])

export const Zap = createIcon("Zap", [
  [
    "path",
    {
      "d": "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      "key": "1xq2db"
    }
  ]
])

export const ArrowUpRight = createIcon("ArrowUpRight", [
  ["path", { d: "M7 7h10v10", key: "1tivn9" }],
  ["path", { d: "M7 17 17 7", key: "1vkiza" }]
])

export const Package = createIcon("Package", [
  [
    "path",
    {
      d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",
      key: "1a0edw"
    }
  ],
  ["path", { d: "M12 22V12", key: "d0xqtd" }],
  ["path", { d: "m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7", key: "yx3hmr" }],
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }]
])

export const Play = createIcon("Play", [
  ["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]
])

export const Terminal = createIcon("Terminal", [
  ["polyline", { points: "4 17 10 11 4 5", key: "akl6gq" }],
  ["line", { x1: "12", x2: "20", y1: "19", y2: "19", key: "q2wloq" }]
])

export const Unlock = createIcon("Unlock", [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 9.9-1", key: "1mm8w8" }]
])

export const Wand2 = createIcon("Wand2", [
  [
    "path",
    {
      d: "m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72",
      key: "ul74o6"
    }
  ],
  ["path", { d: "m14 7 3 3", key: "1r5n42" }],
  ["path", { d: "M5 6v4", key: "ilb8ba" }],
  ["path", { d: "M19 14v4", key: "blhpug" }],
  ["path", { d: "M10 2v2", key: "7u0qdc" }],
  ["path", { d: "M7 8H3", key: "zfb6yr" }],
  ["path", { d: "M21 16h-4", key: "1cnmox" }],
  ["path", { d: "M11 3H9", key: "1obp7u" }]
])
