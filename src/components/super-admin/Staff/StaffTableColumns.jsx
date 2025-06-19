import {
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  MapPin,
  ToggleLeft,
  ToggleRight,
  History,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

export const getRoleBadge = (role) => {
  const roleConfig = {
    super_admin: { color: "red", icon: Shield },
    manager: { color: "blue", icon: Users },
    consultant: { color: "green", icon: UserCheck },
    receptionist: { color: "purple", icon: UserCheck },
    student: { color: "gray", icon: Users },
  };

  const config = roleConfig[role] || roleConfig.student;
  const Icon = config.icon;

  return (
    <Badge color={config.color} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {role?.replace("_", " ")}
    </Badge>
  );
};

export const getStatusBadge = (isActive) => {
  return (
    <Badge
      color={isActive ? "green" : "gray"}
      className="flex items-center gap-1"
    >
      {isActive ? (
        <UserCheck className="w-3 h-3" />
      ) : (
        <UserX className="w-3 h-3" />
      )}
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
};

export const getStaffTableColumns = ({
  handleViewLogs,
  handleEditStaff,
  handleToggleStatus,
  setDeleteConfirm,
}) => [
  {
    key: "name",
    label: "Staff Member",
    sortable: true,
    render: (user) => (
      <div>
        <div className="font-medium">{user.name}</div>
        <div className="text-sm text-gray-500 flex items-center gap-1">
          <Mail className="w-3 h-3" />
          {user.email}
        </div>
      </div>
    ),
  },
  {
    key: "role",
    label: "Role",
    sortable: true,
    render: (user) => getRoleBadge(user?.role),
  },
  {
    key: "contact",
    label: "Contact",
    render: (user) => (
      <div className="text-sm space-y-1">
        {user && user.phone ? (
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {user.phone}
          </div>
        ) : (
          <span className="text-gray-500">No phone</span>
        )}
      </div>
    ),
  },
  {
    key: "office",
    label: "Office",
    render: (user) => (
      <div>
        {user?.office ? (
          <>
            <div className="font-medium">{user?.office?.name}</div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {user.office.address?.city}
            </div>
          </>
        ) : (
          <Badge color="gray">No Office</Badge>
        )}
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (user) => getStatusBadge(user?.isActive),
  },
  {
    key: "lastLogin",
    label: "Last Login",
    sortable: true,
    render: (user) => (
      <div className="text-sm">
        {user?.lastLogin ? (
          <>
            <div>{new Date(user?.lastLogin).toLocaleDateString()}</div>
            <div className="text-gray-500">
              {new Date(user?.lastLogin).toLocaleTimeString()}
            </div>
          </>
        ) : (
          <span className="text-gray-500">Never</span>
        )}
      </div>
    ),
  },
  {
    key: "createdAt",
    label: "Joined",
    sortable: true,
    render: (user) => new Date(user?.createdAt).toLocaleDateString(),
  },
  {
    key: "actions",
    label: "Actions",
    render: (user) => (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewLogs(user)}
        >
          <History className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleEditStaff(user)}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleToggleStatus(user)}
          className={user.isActive ? "text-orange-600" : "text-green-600"}
        >
          {user.isActive ? (
            <ToggleLeft className="w-4 h-4" />
          ) : (
            <ToggleRight className="w-4 h-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDeleteConfirm(user)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];
