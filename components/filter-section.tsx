"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FilterSectionProps {
  carTypes: string[]
  carBrands: string[]
  selectedType: string | null
  selectedBrand: string | null
  onTypeChange: (type: string | null) => void
  onBrandChange: (brand: string | null) => void
}

export default function FilterSection({
  carTypes = [],
  carBrands = [],
  selectedType,
  selectedBrand,
  onTypeChange,
  onBrandChange,
}: FilterSectionProps) {
  // Get car type icon
  const getCarTypeIcon = (type: string) => {
    return `/car-types/${type.toLowerCase()}.png`
  }

  // Get brand logo
  const getBrandLogo = (brand: string) => {
    return `/brand-logos/${brand.toLowerCase()}.png`
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-3">Car Type</h3>
          <Select
            value={selectedType || "allTypes"}
            onValueChange={(value) => onTypeChange(value === "allTypes" ? null : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allTypes">All Types</SelectItem>
              {carTypes &&
                carTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center">
                      <img
                        src={getCarTypeIcon(type) || "/placeholder.svg?height=20&width=20"}
                        alt={type}
                        className="w-5 h-5 mr-2"
                      />
                      {type}
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium mb-3">Car Brand</h3>
          <Select
            value={selectedBrand || "allBrands"}
            onValueChange={(value) => onBrandChange(value === "allBrands" ? null : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allBrands">All Brands</SelectItem>
              {carBrands &&
                carBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    <div className="flex items-center">
                      <img
                        src={getBrandLogo(brand) || "/placeholder.svg?height=20&width=20"}
                        alt={brand}
                        className="w-5 h-5 mr-2"
                      />
                      {brand}
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
