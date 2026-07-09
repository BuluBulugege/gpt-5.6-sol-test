import { weatherScenes } from './weather-data.js'

const track = document.querySelector('#weather-track')
const template = document.querySelector('#weather-card-template')
const progress = document.querySelector('#progress')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

if (!(track instanceof HTMLElement) || !(template instanceof HTMLTemplateElement) || !(progress instanceof HTMLElement)) {
  throw new Error('天气页面初始化失败：缺少必要的页面节点。')
}

const iconMarkup = Object.freeze({
  sun: '<span class="mini-icon mini-icon--sun">☀</span>',
  haze: '<span class="mini-icon">◒</span>',
  moon: '<span class="mini-icon">◐</span>',
  wind: '<span class="mini-icon">≋</span>',
  cloud: '<span class="mini-icon">☁</span>',
  storm: '<span class="mini-icon">ϟ</span>',
  rain: '<span class="mini-icon">☂</span>',
  snow: '<span class="mini-icon">✣</span>',
})

const createWeatherArt = (id) => {
  const art = document.createElement('div')
  art.className = `scene scene--${id}`

  const layers = {
    sunny: '<div class="sun-orbit"><div class="sun-core"></div></div><div class="sun-haze"></div><div class="land land--one"></div><div class="land land--two"></div>',
    windy: '<div class="wind-cloud wind-cloud--one"></div><div class="wind-cloud wind-cloud--two"></div><div class="wind-line wind-line--one"></div><div class="wind-line wind-line--two"></div><div class="wind-line wind-line--three"></div>',
    stormy: '<div class="storm-cloud storm-cloud--one"></div><div class="storm-cloud storm-cloud--two"></div><div class="lightning"></div><div class="rain-field"></div>',
    snowy: '<div class="snow-cloud"></div><div class="snow-field"></div><div class="snow-bank snow-bank--one"></div><div class="snow-bank snow-bank--two"></div>',
  }

  art.innerHTML = layers[id]
  return art
}

const createMetric = ({ label, value }) => {
  const item = document.createElement('div')
  const term = document.createElement('dt')
  const description = document.createElement('dd')
  term.textContent = label
  description.textContent = value
  item.append(term, description)
  return item
}

const createHour = ({ time, icon, temperature }) => {
  const item = document.createElement('div')
  const timeLabel = document.createElement('span')
  const iconWrapper = document.createElement('span')
  const temperatureLabel = document.createElement('strong')
  item.className = 'hour-item'
  timeLabel.textContent = time
  iconWrapper.innerHTML = iconMarkup[icon]
  temperatureLabel.textContent = temperature
  item.append(timeLabel, iconWrapper.firstElementChild, temperatureLabel)
  return item
}

const renderCard = (scene, index) => {
  const fragment = template.content.cloneNode(true)
  const card = fragment.querySelector('.weather-card')
  card.classList.add(`weather-card--${scene.id}`)
  card.dataset.weather = scene.id
  card.style.setProperty('--accent', scene.accent)
  card.setAttribute('aria-label', `${scene.location}，${scene.label}，${scene.temperature}`)
  card.setAttribute('aria-roledescription', '天气卡片')

  fragment.querySelector('.weather-art').append(createWeatherArt(scene.id))
  fragment.querySelector('.condition-index').textContent = String(index + 1).padStart(2, '0')
  fragment.querySelector('.condition-english').textContent = scene.englishLabel
  fragment.querySelector('.condition-pill span').textContent = scene.time
  fragment.querySelector('.location').textContent = scene.location
  fragment.querySelector('.temperature').textContent = scene.temperature
  fragment.querySelector('.condition-copy h2').textContent = scene.label
  fragment.querySelector('.range').textContent = scene.range
  fragment.querySelector('.summary').textContent = scene.summary

  const metrics = fragment.querySelector('.metrics')
  scene.metrics.forEach((metric) => metrics.append(createMetric(metric)))

  const hourly = fragment.querySelector('.hourly')
  scene.hourly.forEach((hour) => hourly.append(createHour(hour)))

  return fragment
}

const renderProgress = () => {
  weatherScenes.forEach((scene, index) => {
    const dot = document.createElement('button')
    dot.type = 'button'
    dot.className = 'progress-dot'
    dot.setAttribute('aria-label', `前往${scene.label}卡片`)
    dot.addEventListener('click', () => scrollToCard(index))
    progress.append(dot)
  })
}

weatherScenes.map(renderCard).forEach((card) => track.append(card))
renderProgress()

const cards = [...track.querySelectorAll('.weather-card')]
const dots = [...progress.querySelectorAll('.progress-dot')]

const scrollToCard = (index) => {
  cards[index]?.scrollIntoView({
    behavior: reducedMotion.matches ? 'auto' : 'smooth',
    inline: 'center',
    block: 'nearest',
  })
}

const setActiveCard = (activeCard) => {
  cards.forEach((card, index) => {
    const active = card === activeCard
    card.classList.toggle('is-active', active)
    card.setAttribute('aria-current', active ? 'true' : 'false')
    dots[index].classList.toggle('is-active', active)
    dots[index].setAttribute('aria-current', active ? 'true' : 'false')
  })
}

const visibilityRatios = new Map(cards.map((card) => [card, 0]))
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(({ target, intersectionRatio }) => visibilityRatios.set(target, intersectionRatio))
    const visible = [...visibilityRatios.entries()].sort((a, b) => b[1] - a[1])[0]

    if (visible?.[1] > 0) setActiveCard(visible[0])
  },
  { root: track, threshold: [0.45, 0.7, 0.9] },
)

cards.forEach((card) => observer.observe(card))
setActiveCard(cards[0])

document.querySelectorAll('.rail-button').forEach((button) => {
  button.addEventListener('click', () => {
    const activeIndex = Math.max(0, cards.findIndex((card) => card.classList.contains('is-active')))
    const direction = Number(button.dataset.direction)
    const nextIndex = Math.min(cards.length - 1, Math.max(0, activeIndex + direction))
    scrollToCard(nextIndex)
  })
})

track.addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
  event.preventDefault()
  const activeIndex = Math.max(0, cards.findIndex((card) => card.classList.contains('is-active')))
  const direction = event.key === 'ArrowRight' ? 1 : -1
  scrollToCard(Math.min(cards.length - 1, Math.max(0, activeIndex + direction)))
})

const pointerHandlers = new Map()

const syncPointerEffects = () => {
  cards.forEach((card) => {
    const existingHandlers = pointerHandlers.get(card)
    if (existingHandlers) {
      card.removeEventListener('pointermove', existingHandlers.move)
      card.removeEventListener('pointerleave', existingHandlers.leave)
      pointerHandlers.delete(card)
    }

    if (reducedMotion.matches) return

    let animationFrame = 0
    const move = (event) => {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => {
      const bounds = card.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / bounds.width - 0.5
      const y = (event.clientY - bounds.top) / bounds.height - 0.5
      card.style.setProperty('--pointer-x', `${x * 10}px`)
      card.style.setProperty('--pointer-y', `${y * 10}px`)
      card.style.setProperty('--glow-x', `${(x + 0.5) * 100}%`)
      card.style.setProperty('--glow-y', `${(y + 0.5) * 100}%`)
      })
    }

    const leave = () => {
      cancelAnimationFrame(animationFrame)
      card.style.setProperty('--pointer-x', '0px')
      card.style.setProperty('--pointer-y', '0px')
      card.style.setProperty('--glow-x', '50%')
      card.style.setProperty('--glow-y', '50%')
    }

    pointerHandlers.set(card, { move, leave })
    card.addEventListener('pointermove', move)
    card.addEventListener('pointerleave', leave)
  })
}

syncPointerEffects()
reducedMotion.addEventListener('change', syncPointerEffects)

const formatDate = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
}).format(new Date())
document.querySelector('#current-date').textContent = formatDate
