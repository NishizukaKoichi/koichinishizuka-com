import { redirect } from "next/navigation"

export default function SpellLoginPage() {
  redirect("/talisman/login?next=%2Fspell")
}
