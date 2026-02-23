import { apiClient } from '../base/ApiClient'
import { ApiResponse } from '../base/types'

export interface MaquetteAnalyzeMetadata {
  anneeScolaire: string | null
  cycleRaw: string
  cycleCode: string
  promotions: string[]
  feuilles: string[]
  specialites?: Array<{
    code: string
    label: string | null
    type: 'OPTION' | 'SPECIALITE' | 'COMMUN'
  }>
}

export interface MaquetteAnalyzeMatiere {
  promotionCode: string
  ueNom: string
  matiereNom: string
  semestres: number[]
  specialiteCode?: string | null
  specialiteLabel?: string | null
  specialiteType?: 'OPTION' | 'SPECIALITE' | 'COMMUN' | null
  evaluations?: Array<{
    nom: string
    type: 'INTERMEDIAIRE' | 'FINALE' | 'CONTROLE_CONTINU' | 'TRAVAUX_PRATIQUES' | 'PROJET' | 'AUTRE'
    poids: number
    ordre?: number | null
  }>
}

export interface MaquetteAnalyzeResponse {
  warnings: string[]
  metadata: MaquetteAnalyzeMetadata
  matieres: MaquetteAnalyzeMatiere[]
}

export interface MaquetteImportResponse {
  insertedMatieres: number
  updatedMatieres: number
  skippedMatieres: number
  insertedExamEvents?: number
  skippedExamEvents?: number
  warnings: string[]
  examEventsToCreate: unknown[]
}

export interface MaquetteRequestOptions {
  cycleHint?: string
  promotionHint?: string
}

export interface MaquetteImportOptions extends MaquetteRequestOptions {
  dryRun?: boolean
}

class MaquetteApi {
  async analyze(
    file: File,
    options: MaquetteRequestOptions = {},
  ): Promise<ApiResponse<MaquetteAnalyzeResponse>> {
    const formPayload: Record<string, string> = {}

    if (options.cycleHint) formPayload.cycleHint = options.cycleHint
    if (options.promotionHint) formPayload.promotionHint = options.promotionHint

    return apiClient.uploadFile<MaquetteAnalyzeResponse>(
      '/maquette/analyze',
      file,
      formPayload,
      { timeout: 90000, retries: 0 },
    )
  }

  async import(
    file: File,
    options: MaquetteImportOptions = {},
  ): Promise<ApiResponse<MaquetteImportResponse>> {
    const formPayload: Record<string, string> = {
      dryRun: String(Boolean(options.dryRun)),
    }

    if (options.cycleHint) formPayload.cycleHint = options.cycleHint
    if (options.promotionHint) formPayload.promotionHint = options.promotionHint

    return apiClient.uploadFile<MaquetteImportResponse>(
      '/maquette/import',
      file,
      formPayload,
      { timeout: 120000, retries: 0 },
    )
  }
}

export const maquetteApi = new MaquetteApi()
export { MaquetteApi }
