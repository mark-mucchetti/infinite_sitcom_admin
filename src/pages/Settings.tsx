import { useState } from 'react'
import { Cog6ToothIcon, BellIcon, KeyIcon, ServerIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useUIStore } from '@/store/ui'

export default function Settings() {
  const { showToast } = useUIStore()
  const [apiKey, setApiKey] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [autoGenerate, setAutoGenerate] = useState(false)
  
  const handleSaveSettings = () => {
    showToast({
      type: 'success',
      title: 'Settings saved',
      message: 'Your preferences have been updated successfully.'
    })
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure your WPVI admin preferences
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {/* API Configuration */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">API Configuration</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configure your AI service credentials and endpoints
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
                      Claude API Key
                    </label>
                    <Input
                      type="password"
                      id="api-key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-ant-..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="api-endpoint" className="block text-sm font-medium text-gray-700">
                      API Endpoint
                    </label>
                    <Input
                      type="text"
                      id="api-endpoint"
                      defaultValue="http://localhost:8055"
                      className="mt-1"
                      disabled
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Currently using local backend API
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Notifications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configure how you receive updates about generation tasks
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="notifications"
                        name="notifications"
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notifications" className="font-medium text-gray-700">
                        Browser Notifications
                      </label>
                      <p className="text-gray-500">Get notified when generation tasks complete</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="auto-generate"
                        name="auto-generate"
                        type="checkbox"
                        checked={autoGenerate}
                        onChange={(e) => setAutoGenerate(e.target.checked)}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="auto-generate" className="font-medium text-gray-700">
                        Auto-generate Scripts
                      </label>
                      <p className="text-gray-500">Automatically start script generation after episode creation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generation Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Generation Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configure AI generation parameters
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
                      AI Temperature
                    </label>
                    <select
                      id="temperature"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      defaultValue="0.7"
                    >
                      <option value="0.5">Conservative (0.5)</option>
                      <option value="0.7">Balanced (0.7)</option>
                      <option value="0.9">Creative (0.9)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="max-retries" className="block text-sm font-medium text-gray-700">
                      Max Retries
                    </label>
                    <Input
                      type="number"
                      id="max-retries"
                      defaultValue="3"
                      min="1"
                      max="10"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}