
import Image from 'next/image'

export function SidebarLogo() {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white">
          <Image src="/logo/eiduLogo.png" alt="StudyAI Logo" width={40} height={40} />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold text-gray-900">StudyAI</span>
        <span className="text-xs text-gray-500">Admin Panel</span>
      </div>
    </div>
  )
}
