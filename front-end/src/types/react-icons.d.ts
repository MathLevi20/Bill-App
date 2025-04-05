declare module 'react-icons' {
  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }

  export type IconType = React.ComponentType<IconBaseProps>;
}

declare module 'react-icons/fa' {
  import { IconType } from 'react-icons';
  
  // Navigation icons
  export const FaHome: IconType;
  export const FaBook: IconType;
  export const FaUserShield: IconType;
  export const FaBars: IconType;
  export const FaTimes: IconType;
  
  // Table and action icons
  export const FaDownload: IconType;
  export const FaSpinner: IconType;
  
  // Admin panel icons
  export const FaCloudUploadAlt: IconType;
  export const FaFileAlt: IconType;
  export const FaCog: IconType;
  export const FaFolder: IconType;
  export const FaEye: IconType;
  export const FaTrashAlt: IconType;
  export const FaExclamationTriangle: IconType;
  
  // Other commonly used icons
  export const FaCheck: IconType;
  export const FaTrash: IconType;
  export const FaEdit: IconType;
  export const FaPlus: IconType;
  export const FaMinus: IconType;
  export const FaSearch: IconType;
  export const FaArrowLeft: IconType;
  export const FaArrowRight: IconType;
  export const FaExclamationCircle: IconType;
  export const FaCheckCircle: IconType;
}

declare module 'react-icons/md' {
  import { IconType } from 'react-icons';
  
  export const MdHome: IconType;
  export const MdLibraryBooks: IconType;
  export const MdAdminPanelSettings: IconType;
  export const MdDashboard: IconType;
  export const MdSettings: IconType;
  export const MdPerson: IconType;
  export const MdMenu: IconType;
  export const MdClose: IconType;
}
