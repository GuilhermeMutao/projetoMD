// Sistema de Versionamento de Documentos (estilo Notion)

export interface DocumentVersion {
  id: string;
  documentId: string;
  content: string;
  title: string;
  versionNumber: number;
  createdAt: string;
  createdBy?: string; // Para futuro: username/email
  changelog?: string; // Descrição das mudanças
}

export interface DocumentWithVersions {
  current: any; // Document atual
  versions: DocumentVersion[];
}

const VERSIONS_KEY = 'mdproject_versions';

export const VersioningService = {
  // Criar uma nova versão
  createVersion: (
    documentId: string,
    content: string,
    title: string,
    changelog?: string
  ): DocumentVersion => {
    const versions = VersioningService.getVersions(documentId);
    const versionNumber = versions.length;

    const version: DocumentVersion = {
      id: Math.random().toString(36).substring(7),
      documentId,
      content,
      title,
      versionNumber,
      createdAt: new Date().toISOString(),
      changelog,
    };

    const allVersions = VersioningService.getAllVersions();
    allVersions.push(version);
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(allVersions));

    console.log(`✅ Versão ${versionNumber} criada para documento ${documentId}`);
    return version;
  },

  // Obter todas as versões de um documento
  getVersions: (documentId: string): DocumentVersion[] => {
    try {
      const allVersions = VersioningService.getAllVersions();
      return allVersions
        .filter((v) => v.documentId === documentId)
        .sort((a, b) => b.versionNumber - a.versionNumber);
    } catch (error) {
      console.error('Erro ao obter versões:', error);
      return [];
    }
  },

  // Obter uma versão específica
  getVersion: (versionId: string): DocumentVersion | undefined => {
    try {
      const allVersions = VersioningService.getAllVersions();
      return allVersions.find((v) => v.id === versionId);
    } catch (error) {
      console.error('Erro ao obter versão:', error);
      return undefined;
    }
  },

  // Obter todas as versões (de todos os documentos)
  getAllVersions: (): DocumentVersion[] => {
    try {
      const data = localStorage.getItem(VERSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao obter todas as versões:', error);
      return [];
    }
  },

  // Restaurar uma versão anterior
  restoreVersion: (
    versionId: string,
    onRestore: (content: string, title: string) => void
  ): boolean => {
    try {
      const version = VersioningService.getVersion(versionId);
      if (version) {
        onRestore(version.content, version.title);
        console.log(`✅ Versão ${version.versionNumber} restaurada`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao restaurar versão:', error);
      return false;
    }
  },

  // Deletar uma versão específica
  deleteVersion: (versionId: string): void => {
    try {
      const allVersions = VersioningService.getAllVersions();
      const filtered = allVersions.filter((v) => v.id !== versionId);
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(filtered));
      console.log('✅ Versão deletada');
    } catch (error) {
      console.error('Erro ao deletar versão:', error);
    }
  },

  // Deletar todas as versões de um documento
  deleteDocumentVersions: (documentId: string): void => {
    try {
      const allVersions = VersioningService.getAllVersions();
      const filtered = allVersions.filter((v) => v.documentId !== documentId);
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(filtered));
      console.log('✅ Todas as versões do documento deletadas');
    } catch (error) {
      console.error('Erro ao deletar versões:', error);
    }
  },

  // Comparar duas versões
  compareVersions: (versionId1: string, versionId2: string) => {
    const v1 = VersioningService.getVersion(versionId1);
    const v2 = VersioningService.getVersion(versionId2);

    if (!v1 || !v2) return null;

    return {
      version1: v1,
      version2: v2,
      contentDiff: {
        from: v1.content,
        to: v2.content,
      },
    };
  },

  // Obter último commit/versão
  getLatestVersion: (documentId: string): DocumentVersion | undefined => {
    const versions = VersioningService.getVersions(documentId);
    return versions.length > 0 ? versions[0] : undefined;
  },

  // Obter estatísticas de um documento
  getDocumentStats: (documentId: string) => {
    const versions = VersioningService.getVersions(documentId);
    const latestVersion = versions[0];

    return {
      totalVersions: versions.length,
      lastModified: latestVersion?.createdAt,
      versionHistory: versions.map((v) => ({
        number: v.versionNumber,
        date: v.createdAt,
        title: v.title,
        changelog: v.changelog,
      })),
    };
  },

  // Exportar histórico de versões como JSON
  exportVersionHistory: (documentId: string): string => {
    const versions = VersioningService.getVersions(documentId);
    return JSON.stringify(versions, null, 2);
  },

  // Limpar versões antigas (manter últimas N versões)
  pruneOldVersions: (documentId: string, keepCount: number = 20): number => {
    try {
      const versions = VersioningService.getVersions(documentId);
      if (versions.length <= keepCount) return 0;

      const versionsToDelete = versions.slice(keepCount);
      const allVersions = VersioningService.getAllVersions();
      const filtered = allVersions.filter(
        (v) => !versionsToDelete.find((vd) => vd.id === v.id)
      );

      localStorage.setItem(VERSIONS_KEY, JSON.stringify(filtered));
      console.log(`✅ ${versionsToDelete.length} versões antigas removidas`);
      return versionsToDelete.length;
    } catch (error) {
      console.error('Erro ao limpar versões:', error);
      return 0;
    }
  },

  // Auto-criar versão a cada X mudanças (debounced)
  createAutoVersion: (documentId: string, content: string, title: string): void => {
    const latestVersion = VersioningService.getLatestVersion(documentId);
    
    // Só cria nova versão se o conteúdo mudou significativamente (>50 caracteres)
    if (!latestVersion || content !== latestVersion.content) {
      // E se passou tempo suficiente (5+ minutos)
      if (
        !latestVersion ||
        new Date().getTime() - new Date(latestVersion.createdAt).getTime() > 5 * 60 * 1000
      ) {
        VersioningService.createVersion(
          documentId,
          content,
          title,
          'Auto-saved version'
        );
      }
    }
  },
};
