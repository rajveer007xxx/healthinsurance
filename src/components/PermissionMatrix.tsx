import React from 'react';

interface Permission {
  code: string;
  label: string;
}

interface PermissionGroup {
  id: string;
  label: string;
  permissions: Permission[];
}

interface PermissionMatrixProps {
  groups: PermissionGroup[];
  selectedPermissions: Set<string>;
  onChange: (permissions: Set<string>) => void;
}

const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  groups,
  selectedPermissions,
  onChange,
}) => {
  const handleTogglePermission = (code: string) => {
    const newPermissions = new Set(selectedPermissions);
    if (newPermissions.has(code)) {
      newPermissions.delete(code);
    } else {
      newPermissions.add(code);
    }
    onChange(newPermissions);
  };

  const handleSelectAllGroup = (group: PermissionGroup) => {
    const newPermissions = new Set(selectedPermissions);
    const allSelected = group.permissions.every(p => selectedPermissions.has(p.code));
    
    if (allSelected) {
      group.permissions.forEach(p => newPermissions.delete(p.code));
    } else {
      group.permissions.forEach(p => newPermissions.add(p.code));
    }
    
    onChange(newPermissions);
  };

  const handleSelectAll = () => {
    const allPermissions = groups.flatMap(g => g.permissions.map(p => p.code));
    const allSelected = allPermissions.every(code => selectedPermissions.has(code));
    
    if (allSelected) {
      onChange(new Set());
    } else {
      onChange(new Set(allPermissions));
    }
  };

  const isGroupFullySelected = (group: PermissionGroup) => {
    return group.permissions.every(p => selectedPermissions.has(p.code));
  };

  const allPermissions = groups.flatMap(g => g.permissions.map(p => p.code));
  const allSelected = allPermissions.every(code => selectedPermissions.has(code));

  return (
    <div className="space-y-4">
      {/* Global Select All */}
      <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-200">
        <span className="text-sm font-medium text-teal-900">Select/Deselect All Permissions</span>
        <button
          type="button"
          onClick={handleSelectAll}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            allSelected
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-white text-teal-700 border border-teal-300 hover:bg-teal-50'
          }`}
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Permission Groups */}
      {groups.map((group) => (
        <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Group Header */}
          <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{group.label}</h3>
            <button
              type="button"
              onClick={() => handleSelectAllGroup(group)}
              className="px-3 py-1 bg-white text-teal-700 rounded text-sm font-medium hover:bg-teal-50 transition-colors"
            >
              {isGroupFullySelected(group) ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Group Permissions */}
          <div className="p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {group.permissions.map((permission) => (
                <label
                  key={permission.code}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.has(permission.code)}
                    onChange={() => handleTogglePermission(permission.code)}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">{permission.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PermissionMatrix;
