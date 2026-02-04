import '@logseq/libs'

/**
 * Pretty Logseq - Custom Page Preview Popovers
 *
 * This plugin replaces/supplements Logseq's default hover previews
 * with custom popovers that display page properties in a rich format.
 *
 * See docs/RESEARCH.md for implementation details and API reference.
 */

const POPOVER_ID = 'pretty-logseq-popover'

interface PageProperties {
  type?: string
  status?: string
  description?: string
  icon?: string
  area?: string
  [key: string]: unknown
}

/**
 * Main plugin entry point
 */
async function main() {
  console.log('Pretty Logseq plugin loaded')

  // Register plugin styles
  logseq.provideStyle(`
    .pretty-popover {
      position: fixed;
      z-index: 9999;
      background: var(--ls-primary-background-color);
      border: 1px solid var(--ls-border-color);
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 320px;
      min-width: 200px;
      pointer-events: none;
    }

    .pretty-popover__title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 8px;
      color: var(--ls-primary-text-color);
    }

    .pretty-popover__description {
      font-size: 13px;
      color: var(--ls-secondary-text-color);
      margin-bottom: 8px;
    }

    .pretty-popover__properties {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .pretty-popover__tag {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--ls-tertiary-background-color);
      color: var(--ls-secondary-text-color);
    }
  `)

  // Set up hover event listeners
  setupHoverListeners()
}

/**
 * Set up hover event listeners on page references
 */
function setupHoverListeners() {
  let hoverTimeout: ReturnType<typeof setTimeout> | null = null
  let currentPopover: HTMLElement | null = null

  // Use event delegation on the main content area
  const handleMouseOver = async (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const pageRef = target.closest('.page-ref') as HTMLElement | null

    if (!pageRef) return

    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
    }

    // Delay before showing popover
    hoverTimeout = setTimeout(async () => {
      const pageName = getPageNameFromRef(pageRef)
      if (!pageName) return

      const pageData = await fetchPageData(pageName)
      if (pageData) {
        showPopover(pageRef, pageData)
      }
    }, 300) // 300ms delay like native Logseq
  }

  const handleMouseOut = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const pageRef = target.closest('.page-ref')

    if (pageRef) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
        hoverTimeout = null
      }
      hidePopover()
    }
  }

  // Attach listeners to document (event delegation)
  document.addEventListener('mouseover', handleMouseOver)
  document.addEventListener('mouseout', handleMouseOut)
}

/**
 * Extract page name from a .page-ref element
 */
function getPageNameFromRef(element: HTMLElement): string | null {
  // The page name is typically in the data-ref attribute or inner text
  const dataRef = element.getAttribute('data-ref')
  if (dataRef) return dataRef

  // Fallback to text content
  return element.textContent?.trim() || null
}

/**
 * Fetch page data including properties from Logseq
 */
async function fetchPageData(pageName: string): Promise<{ name: string; properties: PageProperties } | null> {
  try {
    const page = await logseq.Editor.getPage(pageName)
    if (!page) return null

    return {
      name: page.originalName || page.name,
      properties: (page.properties || {}) as PageProperties
    }
  } catch (err) {
    console.error('Failed to fetch page data:', err)
    return null
  }
}

/**
 * Show the custom popover near the hovered element
 */
function showPopover(anchor: HTMLElement, pageData: { name: string; properties: PageProperties }) {
  hidePopover() // Remove any existing popover

  const { name, properties } = pageData

  // Build popover HTML
  const popoverHtml = buildPopoverHtml(name, properties)

  // Create popover element
  const popover = document.createElement('div')
  popover.id = POPOVER_ID
  popover.className = 'pretty-popover'
  popover.innerHTML = popoverHtml

  // Position the popover
  const rect = anchor.getBoundingClientRect()
  popover.style.left = `${rect.left}px`
  popover.style.top = `${rect.bottom + 8}px`

  document.body.appendChild(popover)

  // Adjust if popover goes off screen
  adjustPopoverPosition(popover)
}

/**
 * Build the HTML content for the popover
 */
function buildPopoverHtml(name: string, properties: PageProperties): string {
  const { icon, description, type, status, area, ...otherProps } = properties

  let html = ''

  // Title with optional icon
  const displayIcon = icon ? `${icon} ` : ''
  html += `<div class="pretty-popover__title">${displayIcon}${name}</div>`

  // Description if available
  if (description) {
    html += `<div class="pretty-popover__description">${description}</div>`
  }

  // Property tags
  const tags: string[] = []
  if (type) tags.push(cleanPropertyValue(type))
  if (status) tags.push(cleanPropertyValue(status))
  if (area) tags.push(cleanPropertyValue(area))

  if (tags.length > 0) {
    html += '<div class="pretty-popover__properties">'
    tags.forEach(tag => {
      html += `<span class="pretty-popover__tag">${tag}</span>`
    })
    html += '</div>'
  }

  return html
}

/**
 * Clean property values (remove [[ ]] brackets)
 */
function cleanPropertyValue(value: string): string {
  return value.replace(/^\[\[|\]\]$/g, '').trim()
}

/**
 * Adjust popover position if it goes off screen
 */
function adjustPopoverPosition(popover: HTMLElement) {
  const rect = popover.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // Adjust horizontal position
  if (rect.right > viewportWidth) {
    popover.style.left = `${viewportWidth - rect.width - 16}px`
  }

  // Adjust vertical position (show above if not enough space below)
  if (rect.bottom > viewportHeight) {
    const anchorTop = parseInt(popover.style.top) - rect.height - 16
    popover.style.top = `${anchorTop}px`
  }
}

/**
 * Hide and remove the popover
 */
function hidePopover() {
  const existing = document.getElementById(POPOVER_ID)
  if (existing) {
    existing.remove()
  }
}

// Bootstrap the plugin
logseq.ready(main).catch(console.error)
