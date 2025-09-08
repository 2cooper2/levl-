import type React from "react"
import LevLLogo from "./levl-logo.svg"
import "./ai-matchmaker-messages.css"

const AIThinkingIndicator: React.FC = () => {
  return (
    <div className="ai-thinking-indicator">
      <div className="logo-container">
        <img src={LevLLogo || "/placeholder.svg"} alt="LevL Logo" className="levl-logo" />
      </div>
      <div className="thinking-bubbles">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
      </div>
    </div>
  )
}

export default AIThinkingIndicator
