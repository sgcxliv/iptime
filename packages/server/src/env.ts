import path from 'path'
import { load } from 'ts-dotenv'

const schema = {
    ENV: ['local' as const, 'remote' as const],
    VM_IP_ADDRESS: String
}

try {
    export const env = load(schema, {
        path: path.join(__dirname, '../../../.env')
    })
} catch (error) {
    console.error('Failed to load environment variables:', error)
    // Provide defaults for local development
    export const env = {
        ENV: 'local' as const,
        VM_IP_ADDRESS: 'localhost'
    }
}