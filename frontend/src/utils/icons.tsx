// Mapeamento de ícones Font Awesome
// Usando react-icons que já inclui Font Awesome

import {
  FaBook,
  FaStar,
  FaRegStar,
  FaFolder,
  FaFolderOpen,
  FaFolderPlus,
  FaFile,
  FaFileAlt,
  FaTrash,
  FaSearch,
  FaMoon,
  FaSun,
  FaChevronRight,
  FaChevronDown,
  FaChevronLeft,
  FaEdit,
  FaEye,
  FaBars,
  FaPlus,
  FaArrowRight,
  FaArrowLeft,
  FaCog,
  FaTimes,
  FaCheck,
  FaHome,
  FaExchangeAlt,
  FaCalendar,
  FaList,
  FaThLarge,
  FaClock,
  FaDownload,
  FaUpload,
  FaCopy,
  FaLink,
  FaShare,
} from 'react-icons/fa';

export const Icons = {
  // Navegação e UI
  Book: FaBook,
  Folder: FaFolder,
  FolderOpen: FaFolderOpen,
  FolderPlus: FaFolderPlus,
  File: FaFile,
  FileAlt: FaFileAlt,
  Home: FaHome,
  Menu: FaBars,
  Search: FaSearch,
  Settings: FaCog,
  Close: FaTimes,
  Check: FaCheck,

  // Favoritos
  Star: FaStar,
  StarOutline: FaRegStar,

  // Editor
  Edit: FaEdit,
  Eye: FaEye,
  Toggle: FaExchangeAlt,

  // Tema
  Moon: FaMoon,
  Sun: FaSun,

  // Ações
  Plus: FaPlus,
  Trash: FaTrash,
  Delete: FaTrash,

  // Navegação Direcionada
  ChevronRight: FaChevronRight,
  ChevronDown: FaChevronDown,
  ChevronLeft: FaChevronLeft,
  ArrowRight: FaArrowRight,
  ArrowLeft: FaArrowLeft,

  // Tempo
  Calendar: FaCalendar,
  Clock: FaClock,

  // Visualização
  List: FaList,
  Grid: FaThLarge,

  // Ações avançadas
  Download: FaDownload,
  Upload: FaUpload,
  Copy: FaCopy,
  Link: FaLink,
  Share: FaShare,
};

// Componente para renderizar ícones com tamanho e cor padrão
export const Icon: React.FC<{
  icon: any;
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ icon: IconComponent, size = 16, color = 'currentColor', className, style }) => (
  <IconComponent
    size={size}
    color={color}
    className={className}
    style={style}
  />
);
