"use client"

import { useIntegrationApp, useIntegrations } from "@integration-app/react"
import type { Integration as IntegrationAppIntegration } from "@integration-app/sdk"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function IntegrationList() {
  const integrationApp = useIntegrationApp()
  const { integrations, refresh } = useIntegrations()
  const [loadingIntegration, setLoadingIntegration] = useState<string | null>(null)
  const [configuringIntegration, setConfiguringIntegration] = useState<string | null>(null)

  const handleConnect = async (integration: IntegrationAppIntegration) => {
    try {
      setLoadingIntegration(integration.key)
      await integrationApp.integration(integration.key).openNewConnection()
      refresh()
    } catch (error) {
      console.error("Failed to connect:", error)
    } finally {
      setLoadingIntegration(null)
    }
  }

  const handleDisconnect = async (integration: IntegrationAppIntegration) => {
    if (!integration.connection?.id) return
    try {
      setLoadingIntegration(integration.key)
      await integrationApp.connection(integration.connection.id).archive()
      refresh()
    } catch (error) {
      console.error("Failed to disconnect:", error)
    } finally {
      setLoadingIntegration(null)
    }
  }

  const handleConfigure = async (integration: IntegrationAppIntegration) => {
    if (!integration.connection?.id) return
    try {
      setConfiguringIntegration(integration.key)
      await integrationApp
        .connection(integration.connection.id)
        .fieldMapping('contacts')
        .openConfiguration()
    } catch (error) {
      console.error("Failed to open configuration:", error)
    } finally {
      setConfiguringIntegration(null)
    }
  }

  return (
    <ul className="space-y-4 mt-8">
      {integrations.map((integration) => {
        const isLoading = loadingIntegration === integration.key
        const isConfiguring = configuringIntegration === integration.key

        return (
          <li
            key={integration.key}
            className="group flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <div className="flex-shrink-0">
              {integration.logoUri ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={integration.logoUri}
                  alt={`${integration.name} logo`}
                  className="w-10 h-10 rounded-lg"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg font-medium text-gray-600 dark:text-gray-300">
                  {integration.name[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                {integration.name}
              </h3>
            </div>
            <div className="flex gap-2">
              {integration.connection && (
                <button
                  onClick={() => handleConfigure(integration)}
                  disabled={isConfiguring || isLoading}
                  className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-700 dark:hover:text-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isConfiguring ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Configuring...
                    </>
                  ) : (
                    <>⚙️ Configure</>
                  )}
                </button>
              )}
              <button
                onClick={() =>
                  integration.connection
                    ? handleDisconnect(integration)
                    : handleConnect(integration)
                }
                disabled={isLoading || isConfiguring}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  integration.connection
                    ? "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100 hover:bg-red-200 hover:text-red-800 dark:hover:bg-red-800 dark:hover:text-red-100"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-700 dark:hover:text-blue-100"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {integration.connection ? "Disconnecting..." : "Connecting..."}
                  </>
                ) : (
                  integration.connection ? "Disconnect" : "Connect"
                )}
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
