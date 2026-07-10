import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// iOS는 키보드가 레이아웃 뷰포트를 줄이지 않고 위에 덮으므로(안드로이드는
// index.html의 interactive-widget=resizes-content로 해결), 입력 포커스 시
// 키보드 애니메이션이 끝난 뒤 입력창을 보이는 영역 가운데로 끌어온다.
window.addEventListener('focusin', (e) => {
  if (e.target.matches?.('textarea, input:not([type="checkbox"]):not([type="radio"]):not([type="range"])')) {
    setTimeout(() => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 350)
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
