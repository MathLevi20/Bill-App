import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'pt-BR' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (key: string) => string;
}

const translations = {
  'pt-BR': {
    // Navigation
    'dashboard': 'Dashboard',
    'bills_library': 'Biblioteca de Faturas',
    'admin': 'Admin',
    'dark_mode': 'Modo Escuro',
    'light_mode': 'Modo Claro',
    
    // Dashboard page
    'total_energy_consumption': 'Consumo Total de Energia',
    'total_energy_compensated': 'Energia Total Compensada',
    'total_value_without_gd': 'Valor Total sem GD',
    'total_gd_economy': 'Economia Total com GD',
    'energy_results': 'Resultados de Energia (kWh)',
    'financial_results': 'Resultados Financeiros (R$)',
    'monthly_energy_consumption': 'Consumo Mensal de Energia (kWh)',
    'monthly_financial_savings': 'Economia Financeira Mensal (R$)',
    'consumption_vs_compensation': 'Consumo vs Compensação',
    'energy_consumption': 'Consumo de Energia',
    'energy_compensation': 'Compensação de Energia',
    'financial_comparison': 'Comparação Financeira',
    'cost_without_gd': 'Custo sem GD',
    'gd_savings': 'Economia com GD',
    
    // Bills Library
    'no_bills_found': 'Nenhuma fatura encontrada com os filtros atuais.',
    'loading_bills': 'Carregando faturas...',
    'try_adjusting_filters': 'Tente ajustar os filtros para encontrar o que procura.',
    
    // Admin Panel
    'upload_bill_pdf': 'Upload de Fatura PDF',
    'select_client': 'Selecione um Cliente',
    'process_pdf_folder': 'Processar Pasta de PDFs',
    'available_pdf_files': 'Arquivos PDF Disponíveis',
    'reset_database': 'Resetar Banco de Dados',
    'no_pdf_files': 'Nenhum arquivo PDF disponível.',
    'reset_warning': 'Atenção: Esta ação não pode ser desfeita',
    
    // Common
    'loading': 'Carregando...',
    'view': 'Visualizar',
    'reset': 'Resetar',
    'cancel': 'Cancelar',
    'client_number': 'Número da UC',

    // FilterPanel
    'filters': 'Filtros',
    'hide_filters': 'Esconder filtros',
    'show_filters': 'Mostrar filtros',
    'consumer_unit': 'Unidade Consumidora',
    'all_units': 'Todas as UCs',
    'reference_year': 'Ano de Referência',
    'all_years': 'Todos os anos',
    'date_range': 'Período',
    'start_date': 'Data Inicial',
    'end_date': 'Data Final',
    'select_date': 'Selecione a data',
    'clear': 'Limpar',
    'filter': 'Filtrar',
    'last_30_days': 'Últimos 30 dias',
    'last_90_days': 'Últimos 90 dias',
    'this_year': 'Este ano',
    'last_year': 'Ano anterior',
    'clear_dates': 'Limpar datas',

    // Date Quick Filters
    'last_3_months': 'Últimos 3 meses',
    'last_6_months': 'Últimos 6 meses',
    'custom_range': 'Período personalizado',
    'select_start_month': 'Selecione o mês/ano inicial',
    'select_end_month': 'Selecione o mês/ano final',

    // Table Headers and Content
    'download': 'Baixar',
    'unavailable': 'Indisponível',
    'distributor': 'Distribuidora',
    'date_range_warning': 'Selecione datas dentro do mesmo ano',
    'error_loading_bills': 'Erro ao carregar faturas. Tente novamente.',
    'select_year': 'Selecione o ano',

    // Filter Panel Specific
    'select_date_range': 'Selecione o período',
    'quick_filters': 'Filtros rápidos',
   
    'client_name': 'Nome do Cliente',

    // Admin Panel
    'admin_panel': 'Painel Administrativo',
    'upload_section': 'Upload de PDF',
    'drag_drop_files': 'Arraste e solte arquivos PDF aqui, ou clique para selecionar',
    'drop_files_here': 'Solte os arquivos aqui...',
    'select_file': 'Selecionar arquivo',
    'select_client_placeholder': '-- Selecione um cliente --',
    'selected_files': 'Arquivos selecionados',
    'remove_file': 'Remover',
    'upload_files': 'Upload',
    'uploading': 'Enviando...',
    'processing_folder': 'Processar Pasta de PDFs',
    'processing': 'Processando...',
    'process_all_pdfs': 'Processar todos os PDFs na pasta',
    'available_files': 'Arquivos Disponíveis',
    'loading_files': 'Carregando arquivos...',
    'no_pdfs_available': 'Nenhum arquivo PDF disponível.',
    'installation': 'Instalação',
    'reset_database_title': 'Resetar Banco de Dados',
    'reset_warning_message': 'Esta ação irá deletar todas as faturas do banco de dados. Não pode ser desfeita.',
    'reset_all_bills': 'Resetar todas as faturas',
    'confirm_delete': 'Confirmar exclusão',
    'delete_warning': 'Atenção: Esta ação não pode ser desfeita',
    'confirm_delete_message': 'Tem certeza que deseja deletar todas as faturas?',
    'yes_delete': 'Sim, deletar tudo',
    'deleting': 'Deletando...',
    'upload_success': 'arquivo(s) enviado(s) com sucesso.',
    'folder_success': 'Pasta processada com sucesso.',
    'bills_deleted': 'faturas foram deletadas.',
    'select_pdf_files': 'Selecione arquivos PDF válidos.',
    'select_client_error': 'Selecione um cliente.',
    'min_files_error': 'Selecione pelo menos um arquivo.',
    'upload_error': 'Erro ao fazer upload dos arquivos.',
    'process_error': 'Erro ao processar a pasta.',
    'reset_error': 'Erro ao resetar as faturas.',

    // Admin Panel - Updated and expanded
    'upload_section_desc': 'Faça upload de faturas em PDF',
    'selected_files_count': 'arquivos selecionados',
    'remove': 'Remover',
    'processing_section': 'Processamento em Lote',
    'processing_section_desc': 'Processe todos os arquivos PDF da pasta',
    'available_files_section': 'Arquivos Disponíveis',
    'available_files_desc': 'Visualize e gerencie os arquivos PDF disponíveis',
    'reset_section': 'Gerenciamento do Banco de Dados',
    'reset_section_desc': 'Opções de resetar e gerenciar dados',
    'confirm_reset_title': 'Confirmar Reset',
    'confirm_reset_message': 'Você tem certeza que deseja resetar todas as faturas? Esta ação não pode ser desfeita.',
    'processing_status': 'Processando arquivos...',
    'upload_status': 'Fazendo upload...',
    'success_upload': 'Upload realizado com sucesso!',
    'success_process': 'Processamento concluído!',
    'error_generic': 'Ocorreu um erro. Tente novamente.',
    'no_files_selected': 'Nenhum arquivo selecionado',
    'invalid_file_type': 'Tipo de arquivo inválido. Selecione apenas PDFs.',
    'view_pdf': 'Visualizar PDF',

    // Admin Panel - Add missing translations
    'available_pdfs': 'Arquivos PDF Disponíveis',
    'available_pdfs_desc': 'Visualize e gerencie os PDFs carregados no sistema',
    'process_folder_desc': 'Processe automaticamente todos os PDFs na pasta do sistema',
    'process_folder': 'Processamento de Pasta',
    'reset_database_desc': 'Apague todas as faturas do sistema e reinicie o banco de dados',
        'confirm_reset': 'Tem certeza de que deseja redefinir o banco de dados? Esta ação não pode ser desfeita.',
    },
  'en': {
    // Navigation
    'dashboard': 'Dashboard',
    'bills_library': 'Bills Library',
    'admin': 'Admin',
    'dark_mode': 'Dark Mode',
    'light_mode': 'Light Mode',
    
    // Dashboard page
    'total_energy_consumption': 'Total Energy Consumption',
    'total_energy_compensated': 'Total Energy Compensated',
    'total_value_without_gd': 'Total Value without GD',
    'total_gd_economy': 'Total GD Economy',
    'energy_results': 'Energy Results (kWh)',
    'financial_results': 'Financial Results (R$)',
    'monthly_energy_consumption': 'Monthly Energy Consumption (kWh)',
    'monthly_financial_savings': 'Monthly Financial Savings (R$)',
    'consumption_vs_compensation': 'Consumption vs Compensation',
    'energy_consumption': 'Energy Consumption',
    'energy_compensation': 'Energy Compensation',
    'financial_comparison': 'Financial Comparison',
    'cost_without_gd': 'Cost without GD',
    'gd_savings': 'GD Savings',
    
    // Bills Library
    'no_bills_found': 'No bills found with current filters.',
    'loading_bills': 'Loading bills...',
    'try_adjusting_filters': 'Try adjusting your filters to find what you\'re looking for.',
    
    // Admin Panel
    'upload_bill_pdf': 'Upload Bill PDF',
    'select_client': 'Select Client',
    'process_pdf_folder': 'Process PDF Folder',
    'available_pdf_files': 'Available PDF Files',
    'reset_database': 'Reset Database',
    'no_pdf_files': 'No PDF files available.',
    'reset_warning': 'Warning: This action cannot be undone',
    
    // Common
    'loading': 'Loading...',
    'view': 'View',
    'reset': 'Reset',
    'cancel': 'Cancel',
    'client_number': 'Client Number',

    // FilterPanel
    'filters': 'Filters',
    'hide_filters': 'Hide filters',
    'show_filters': 'Show filters',
    'consumer_unit': 'Consumer Unit',
    'all_units': 'All Units',
    'reference_year': 'Reference Year',
    'all_years': 'All years',
    'date_range': 'Date Range',
    'start_date': 'Start Date',
    'end_date': 'End Date',
    'select_date': 'Select date',
    'clear': 'Clear',
    'filter': 'Filter',
    'last_30_days': 'Last 30 days',
    'last_90_days': 'Last 90 days',
    'this_year': 'This year',
    'last_year': 'Last year',
    'clear_dates': 'Clear dates',

    // Date Quick Filters
    'last_3_months': 'Last 3 months',
    'last_6_months': 'Last 6 months',
    'custom_range': 'Custom range',
    'select_start_month': 'Select start month/year',
    'select_end_month': 'Select end month/year',

    // Table Headers and Content
    'download': 'Download',
    'unavailable': 'Unavailable',
    'distributor': 'Distributor',
    'date_range_warning': 'Please select dates within the same year',
    'error_loading_bills': 'Error loading bills. Please try again.',
    'select_year': 'Select year',

    // Filter Panel Specific
    'select_date_range': 'Select date range',
    'quick_filters': 'Quick filters',

    'client_name': 'Client Name',

    // Admin Panel
    'admin_panel': 'Admin Panel',
    'upload_section': 'PDF Upload',
    'drag_drop_files': 'Drag and drop PDF files here, or click to select',
    'drop_files_here': 'Drop files here...',
    'select_file': 'Select file',
    'select_client_placeholder': '-- Select a client --',
    'selected_files': 'Selected files',
    'remove_file': 'Remove',
    'upload_files': 'Upload',
    'uploading': 'Uploading...',
    'processing_folder': 'Process PDF Folder',
    'processing': 'Processing...',
    'process_all_pdfs': 'Process All PDFs in Folder',
    'available_files': 'Available Files',
    'loading_files': 'Loading files...',
    'no_pdfs_available': 'No PDF files available.',
    'installation': 'Installation',
    'reset_database_title': 'Reset Database',
    'reset_warning_message': 'This action will delete all bills from the database. This cannot be undone.',
    'reset_all_bills': 'Reset All Bills',
    'confirm_delete': 'Confirm Delete',
    'delete_warning': 'Warning: This action cannot be undone',
    'confirm_delete_message': 'Are you sure you want to delete all bills?',
    'yes_delete': 'Yes, Delete All',
    'deleting': 'Deleting...',
    'upload_success': 'file(s) uploaded successfully.',
    'folder_success': 'Folder processed successfully.',
    'bills_deleted': 'bills were deleted.',
    'select_pdf_files': 'Please select valid PDF files.',
    'select_client_error': 'Please select a client.',
    'min_files_error': 'Please select at least one file.',
    'upload_error': 'Failed to upload files.',
    'process_error': 'Failed to process folder.',
    'reset_error': 'Failed to reset bills.',

    // Admin Panel - Updated and expanded
    'upload_section_desc': 'Upload PDF bills',
    'selected_files_count': 'files selected',
    'remove': 'Remove',
    'processing_section': 'Batch Processing',
    'processing_section_desc': 'Process all PDF files in the folder',
    'available_files_section': 'Available Files',
    'available_files_desc': 'View and manage available PDF files',
    'reset_section': 'Database Management',
    'reset_section_desc': 'Reset and manage data options',
    'confirm_reset_title': 'Confirm Reset',
    'confirm_reset_message': 'Are you sure you want to reset all bills? This action cannot be undone.',
    'processing_status': 'Processing files...',
    'upload_status': 'Uploading...',
    'success_upload': 'Upload completed successfully!',
    'success_process': 'Processing completed!',
    'error_generic': 'An error occurred. Please try again.',
    'no_files_selected': 'No files selected',
    'invalid_file_type': 'Invalid file type. Select only PDFs.',
    'view_pdf': 'View PDF',

    // Admin Panel - Add missing translations
    'available_pdfs': 'Available PDFs',
    'available_pdfs_desc': 'View and manage uploaded PDFs',
    'process_folder_desc': 'Automatically process all PDFs in the system folder',
    'process_folder': 'Folder Processing',
    'reset_database_desc': 'Delete all bills from the system and reset the database',
      'confirm_reset': 'Are you sure you want to reset the database? This action cannot be undone.', // Added
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get saved language from localStorage or default to pt-BR
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'pt-BR';
  });

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const translate = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]];
    
    // If translation is missing and key is 'view_pdf', return default values
    if (!translation && key === 'view_pdf') {
      return language === 'pt-BR' ? 'Visualizar PDF' : 'View PDF';
    }
    
    // Return translation or key as fallback
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
