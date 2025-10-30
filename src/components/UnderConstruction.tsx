import React from 'react'
import { Construction } from 'lucide-react'

interface UnderConstructionProps {
  pageName: string
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({ pageName }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <Construction className="w-24 h-24 text-isp-teal mb-6" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{pageName}</h1>
      <p className="text-gray-600 text-lg">This page is under construction</p>
      <p className="text-gray-500 text-sm mt-2">Please check back later</p>
    </div>
  )
}

export default UnderConstruction
