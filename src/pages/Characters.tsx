import { useState } from 'react'
import { useShows } from '@/hooks/useShows'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import StatusBadge from '@/components/ui/StatusBadge'
import { showsApi } from '@/services/shows'

interface Character {
  id: string
  show_id: string
  character_name: string
  role_type: 'lead' | 'regular' | 'recurring'
  archetype: string
  age_range: string
  character_relationship: string
  catchphrases?: string
  description: string
  physical_description: string
  eleven_voice_id?: string
}

export default function Characters() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedShow, setSelectedShow] = useState('')
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { shows: showOptions } = useShows({ page: 1, limit: 100 })

  const loadCharacters = async (showId: string) => {
    if (!showId) {
      setCharacters([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await showsApi.getCharacters(showId)
      setCharacters(response || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters')
      setCharacters([])
    } finally {
      setLoading(false)
    }
  }

  const handleShowChange = (showId: string) => {
    setSelectedShow(showId)
    loadCharacters(showId)
  }

  const filteredCharacters = characters.filter(character =>
    character.character_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.archetype.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.role_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleTypeColor = (roleType: string) => {
    switch (roleType) {
      case 'lead':
        return 'bg-blue-100 text-blue-800'
      case 'regular':
        return 'bg-green-100 text-green-800'
      case 'recurring':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-medium">Error loading characters</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={() => selectedShow && loadCharacters(selectedShow)}>Try Again</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Characters
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />

          <select
            value={selectedShow}
            onChange={(e) => handleShowChange(e.target.value)}
            className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Select a Show</option>
            {showOptions.map((show) => (
              <option key={show.id} value={show.id}>
                {show.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8">
        {!selectedShow ? (
          <EmptyState
            title="Select a show"
            description="Choose a show from the dropdown to view its characters."
          />
        ) : loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredCharacters.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Character</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Archetype</TableHeaderCell>
                <TableHeaderCell>Age Range</TableHeaderCell>
                <TableHeaderCell>Relationship</TableHeaderCell>
                <TableHeaderCell>Voice</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCharacters.map((character) => (
                <TableRow key={character.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{character.character_name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {character.catchphrases && `"${character.catchphrases}"`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleTypeColor(character.role_type)}`}>
                      {character.role_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900">{character.archetype}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">{character.age_range.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500 truncate max-w-xs">
                      {character.character_relationship}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm ${character.eleven_voice_id ? 'text-green-600' : 'text-gray-500'}`}>
                      {character.eleven_voice_id ? 'Assigned' : 'Not Assigned'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        Voice
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No characters found"
            description={searchTerm ? 
              "No characters match your search criteria." : 
              "This show doesn't have any characters yet."
            }
          />
        )}
      </div>
    </div>
  )
}