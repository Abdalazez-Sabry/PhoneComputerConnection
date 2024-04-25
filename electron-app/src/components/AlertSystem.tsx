import { Terminal } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { createContext, useContext, useState, PropsWithChildren } from "react"

export interface IAlert {
  title: String
  description?: string
  timeout?: number
  handleDismiss?: Function
}

export interface IAlertContext {
  alert: IAlert
  add: (alert: IAlert) => void
  dismiss: () => void
}

export const AlertContext = createContext<IAlertContext | null>(null)

export function useAlertContext() {
  const context = useContext(AlertContext)
  if (context === null) {
    throw Error(
      "AlertContext must be used inside of a AlertProvider, " +
        "otherwise it will not function correctly."
    )
  }
  return context
}

export function AlertProvider(props: PropsWithChildren) {
  const defaultAlert: IAlert = {
    description: "",
    title: "",
  }

  const [alert, setAlert] = useState<IAlert>(defaultAlert)
  const [displayAlert, setDisplayAlert] = useState(false)
  const [opacity, setOpacity] = useState(0)

  const DEFAULT_TIMEOUT = 2500
  const DEFAULT_HANDLEDISMISS = () => {}
  const TRANSITION_DELAY = 500

  let firstTimer: NodeJS.Timeout | null = null
  let secondTimer: NodeJS.Timeout | null = null

  function addAlert(alert: IAlert) {
    if (firstTimer) {
      clearTimeout(firstTimer)
    }

    if (secondTimer) {
      clearTimeout(secondTimer)
    }

    alert.timeout = alert.timeout || DEFAULT_TIMEOUT
    alert.handleDismiss = alert.handleDismiss || DEFAULT_HANDLEDISMISS

    setAlert(alert)

    firstTimer = setTimeout(() => {
      dismissAlert()
    }, alert.timeout)

    setDisplayAlert(true)
    setOpacity(0)
    setTimeout(() => {
      setOpacity(1)
    }, 0)
  }

  function dismissAlert() {
    setOpacity(0)
    secondTimer = setTimeout(() => {
      setDisplayAlert(false)
    }, TRANSITION_DELAY)
  }

  return (
    <AlertContext.Provider
      value={{ add: addAlert, dismiss: dismissAlert, alert }}
    >
      {displayAlert && (
        <Alert
          className={"absolute top-5 transition-opacity"}
          style={{
            opacity: opacity,
            transitionDuration: "" + TRANSITION_DELAY,
          }}
          onClick={dismissAlert}
        >
          <Terminal className="h-4 w-4" />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      )}
      {props.children}
    </AlertContext.Provider>
  )
}
