import type { SignCategory } from '@/src/lib/signs/types'

type CategoryRailItem = {
  category: SignCategory
  count: number
  highlight: string
}

type CategoryRailProps = {
  items: CategoryRailItem[]
}

function formatCategoryLabel(category: SignCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

export function buildCategoryHref(category: SignCategory) {
  return `/topics/no-kings/${category}`
}

export function CategoryRail({ items }: CategoryRailProps) {
  return (
    <section aria-labelledby="category-rail-title" className="home-section category-rail-section">
      <div className="section-heading section-heading--compact">
        <p className="section-heading__eyebrow">Browse by lane</p>
        <h2 className="section-heading__title" id="category-rail-title">
          Four fast ways into the sign wall
        </h2>
      </div>

      <div className="category-rail" role="list">
        {items.map((item) => (
          <div key={item.category} role="listitem">
            <a className="category-rail__item" href={buildCategoryHref(item.category)}>
              <p className="category-rail__label">{formatCategoryLabel(item.category)}</p>
              <p className="category-rail__count">{item.count} signs</p>
              <p className="category-rail__highlight">Now leading: {item.highlight}</p>
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
