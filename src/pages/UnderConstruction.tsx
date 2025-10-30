import { Construction } from 'lucide-react'

interface UnderConstructionProps {
  pageName: string
}

export default function UnderConstruction({ pageName }: UnderConstructionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 bg-white rounded-lg shadow p-8">
      <Construction className="h-24 w-24 text-yellow-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{pageName}</h2>
      <p className="text-gray-600 text-center">
        This page is currently under construction. Please check back later.
      </p>
    </div>
  )
}
