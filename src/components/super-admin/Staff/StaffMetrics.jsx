import { Users, UserCheck, Shield, Settings } from "lucide-react";
import MetricsWidget from "../../charts/MetricsWidget";

const StaffMetrics = ({ filteredUsers }) => {
  const totalStaff = filteredUsers?.length || 0;
  const activeStaff =
    filteredUsers?.filter((user) => user.isActive)?.length || 0;
  const managers =
    filteredUsers?.filter((user) => user.role === "manager")?.length || 0;
  const consultants =
    filteredUsers?.filter((user) => user.role === "consultant")?.length || 0;
  const receptionists =
    filteredUsers?.filter((user) => user.role === "receptionist")?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <MetricsWidget
        title="Total Staff"
        value={totalStaff}
        icon={<Users className="w-6 h-6" />}
        color="blue"
      />
      <MetricsWidget
        title="Active Staff"
        value={activeStaff}
        icon={<UserCheck className="w-6 h-6" />}
        color="green"
      />
      <MetricsWidget
        title="Managers"
        value={managers}
        icon={<Shield className="w-6 h-6" />}
        color="purple"
      />
      <MetricsWidget
        title="Consultants"
        value={consultants}
        icon={<UserCheck className="w-6 h-6" />}
        color="orange"
      />
      <MetricsWidget
        title="Receptionists"
        value={receptionists}
        icon={<Settings className="w-6 h-6" />}
        color="cyan"
      />
    </div>
  );
};

export default StaffMetrics;
