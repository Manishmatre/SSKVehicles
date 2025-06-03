import React from 'react';
import { useAuth } from '../context/AuthContext';

const PermissionGate = ({ 
    children, 
    requiredRole, 
    requiredPermission, 
    requiredPermissions,
    requireAll = false 
}) => {
    const { user, hasRole, hasPermission } = useAuth();

    if (!user) return null;

    // Check role if specified
    if (requiredRole && !hasRole(requiredRole)) {
        return null;
    }

    // Check single permission
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return null;
    }

    // Check multiple permissions
    if (requiredPermissions) {
        const hasPermissions = requireAll
            ? requiredPermissions.every(permission => hasPermission(permission))
            : requiredPermissions.some(permission => hasPermission(permission));

        if (!hasPermissions) {
            return null;
        }
    }

    return children;
};

export default PermissionGate;