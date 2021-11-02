

import { AlFimConfiguration} from '@al/fim';

export const excludedConfigPayloadPost =
{
    "id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFZ",
    "version": 1,
    "account_id": "12345678",
    "deployment_id": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA",
    "type": "nix_dir",
    "base": "/directory1",
    "pattern": "file",
    "system": false,
    "enabled": true,
    "created": {
        "by": "BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    },
    "modified": {
        "by": "BE985D6B-CA20-416D-A7AD-86D86FBB96C9",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    }
} as AlFimConfiguration;


export const excludedConfigPayloadPut =
{
    "id": "FSFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
    "version": 2,
    "account_id": "12345678",
    "deployment_id": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA",
    "type": "nix_dir",
    "base": "/directory2",
    "pattern": "file",
    "system": false,
    "enabled": true,
    "created": {
        "by": "BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    },
    "modified": {
        "by": "BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB",
        "at": 1588327200,
        "at_iso": "2020-05-01T10:00:00Z"
    }
} as AlFimConfiguration;


export const excludedConfigLinux1 =
{
    "id": "FFFFFFkF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
    "version": 1,
    "account_id": "12345678",
    "deployment_id": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA",
    "type": "nix_dir",
    "base": "/directory3",
    "pattern": "file",
    "system": false,
    "enabled": true,
    "created": {
        "by": "BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    },
    "modified": {
        "by": "BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB",
        "at": 1588327200,
        "at_iso": "2020-05-01T10:00:00Z"
    }
} as AlFimConfiguration;

export const excludedConfigLinux2 =
{
    "id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFvFF",
    "version": 2,
    "account_id": "12345678",
    "deployment_id": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA",
    "type": "nix_dir",
    "base": "/directory4",
    "pattern": "file",
    "system": false,
    "enabled": true,
    "created": {
        "by": "BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    },
    "modified": {
        "by": "BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB",
        "at": 1588327200,
        "at_iso": "2020-05-01T10:00:00Z"
    }
} as AlFimConfiguration;

export const excludedConfigWindowsDirectory1 =
{
    "id": "FFFFFFFF-FFFF-FFFF-FFFF-FFdFFFFFFFFF",
    "version": 3,
    "account_id": "12345678",
    "deployment_id": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA",
    "type": "win_dir",
    "base": "/directory5",
    "pattern": "file",
    "system": false,
    "enabled": true,
    "created": {
        "by": "BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    },
    "modified": {
        "by": "BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB",
        "at": 1588327200,
        "at_iso": "2020-05-01T10:00:00Z"
    }
} as AlFimConfiguration;

export const excludedConfigWindowsDirectory2 =
{
    "id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFsFFFF",
    "version": 4,
    "account_id": "12345678",
    "deployment_id": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA",
    "type": "win_dir",
    "base": "/directory6",
    "pattern": "file",
    "system": false,
    "enabled": true,
    "created": {
        "by": "BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    },
    "modified": {
        "by": "BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB",
        "at": 1588327200,
        "at_iso": "2020-05-01T10:00:00Z"
    }
} as AlFimConfiguration;


export const excludedConfigs = [excludedConfigLinux1,
    excludedConfigLinux2,
    excludedConfigWindowsDirectory1,
    excludedConfigWindowsDirectory2
];


export const monitoredConfigPayloadPost =
{
    "id": "FFFFFFFF-FFFF-FFFF-FFFl-FFFFFFFFFFFF",
    "version": 1,
    "account_id": "12345678",
    "deployment_id": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA",
    "type": "nix_dir",
    "base": "/directory9",
    "pattern": "file",
    "system": false,
    "enabled": true,
    "recursive": false,
    "operations": [
        "create",
        "modify",
        "attrib",
        "remove"
    ],
    "scope": [],
    "created": {
        "by": "BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    },
    "modified": {
        "by": "BE985D6B-CA20-416D-A7AD-86D86FBB96C9",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    }
} as AlFimConfiguration;


export const monitoredConfigPayloadPut =
{
    "id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFqFFFF",
    "version": 2,
    "account_id": "12345678",
    "deployment_id": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA",
    "type": "nix_dir",
    "base": "/directory10",
    "pattern": "file",
    "system": false,
    "enabled": true,
    "recursive": false,
    "operations": [
        "create",
        "modify",
        "attrib",
        "remove"
    ],
    "scope": [],
    "created": {
        "by": "BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    },
    "modified": {
        "by": "BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB",
        "at": 1588327200,
        "at_iso": "2020-05-01T10:00:00Z"
    }
} as AlFimConfiguration;


export const monitoredConfigLinux =
{
    "id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFuFFFFFFF",
    "version": 1,
    "account_id": "134249236",
    "deployment_id": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA",
    "type": "nix_dir",
    "base": "/ban",
    "pattern": "file",
    "system": false,
    "enabled": true,
    "recursive": false,
    "operations": [
        "create",
        "modify",
        "attrib",
        "remove"
    ],
    "scope": [],
    "created": {
        "by": "BE985D6B-CA20-416D-A7AD-86D86FBB96C9",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    },
    "modified": {
        "by": "BE985D6B-CA20-416D-A7AD-86D86FBB96C9",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    }
} as AlFimConfiguration;

export const monitoredConfigLinux2 =
{
    "id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFtFFFFFFFF",
    "version": 2,
    "account_id": "134249236",
    "deployment_id": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA",
    "type": "nix_dir",
    "base": "/bin",
    "pattern": "file",
    "system": false,
    "enabled": true,
    "recursive": false,
    "operations": [
        "create",
        "modify",
        "attrib",
        "remove"
    ],
    "scope": [],
    "created": {
        "by": "BE985D6B-CA20-416D-A7AD-86D86FBB96C9",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    },
    "modified": {
        "by": "BE985D6B-CA20-416D-A7AD-86D86FBB96C9",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    }
} as AlFimConfiguration;

export const monitoredConfigWindowsDirectory =
{
    "id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFyFFFFF",
    "version": 3,
    "account_id": "134249236",
    "deployment_id": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA",
    "type": "win_dir",
    "base": "C:\autoexec.bat",
    "pattern": "file",
    "system": false,
    "enabled": true,
    "recursive": false,
    "operations": [
        "create",
        "modify",
        "attrib",
        "remove"
    ],
    "scope": [],
    "created": {
        "by": "BE985D6B-CA20-416D-A7AD-86D86FBB96C9",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    },
    "modified": {
        "by": "BE985D6B-CA20-416D-A7AD-86D86FBB96C9",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    }
} as AlFimConfiguration;


export const monitoredConfigWindowsDirectory2 =
{
    "id": "FFFxFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
    "version": 4,
    "account_id": "134249236",
    "deployment_id": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA",
    "type": "win_dir",
    "base": "C:\manualexec.bat",
    "pattern": "file",
    "system": false,
    "enabled": true,
    "recursive": false,
    "operations": [
        "create",
        "modify",
        "attrib",
        "remove"
    ],
    "scope": [],
    "created": {
        "by": "BE985D6B-CA20-416D-A7AD-86D86FBB96C9",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    },
    "modified": {
        "by": "BE985D6B-CA20-416D-A7AD-86D86FBB96C9",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    }
} as AlFimConfiguration;

export const monitoredConfigWindowsRegistry =
{
    "id": "FFFFFFFF-FyFF-FFFF-FFFF-FFFFFFFFFFFF",
    "version": 5,
    "account_id": "134249236",
    "deployment_id": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA",
    "type": "win_reg",
    "base": "<windows_registry>HKEY_REMOTE",
    "pattern": "file",
    "system": true,
    "enabled": true,
    "recursive": false,
    "operations": [
        "create",
        "modify",
        "attrib",
        "remove"
    ],
    "scope": [],
    "created": {
        "by": "BE985D6B-CA20-416D-A7AD-86D86FBB96C9",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    },
    "modified": {
        "by": "BE985D6B-CA20-416D-A7AD-86D86FBB96C9",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    }
} as AlFimConfiguration;


export const monitoredConfigWindowsRegistry2 =
{
    "id": "z-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
    "version": 6,
    "account_id": "134249236",
    "deployment_id": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA",
    "type": "win_reg",
    "base": "<windows_registry>HKEY_LOCAL",
    "pattern": "file",
    "system": false,
    "enabled": true,
    "recursive": false,
    "operations": [
        "create",
        "modify",
        "attrib",
        "remove"
    ],
    "scope": [],
    "created": {
        "by": "BE985D6B-CA20-416D-A7AD-86D86FBB96C9",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    },
    "modified": {
        "by": "BE985D6B-CA20-416D-A7AD-86D86FBB96C9",
        "at": 1588323600,
        "at_iso": "2020-05-01T09:00:00Z"
    }
} as AlFimConfiguration;

export const monitoredConfigs = [
    monitoredConfigLinux,
    monitoredConfigWindowsDirectory,
    monitoredConfigWindowsRegistry,
    monitoredConfigLinux2,
    monitoredConfigWindowsDirectory2,
    monitoredConfigWindowsRegistry2,
];


export class MyClientInstance  {
    static getAllConfigurations(pathType, accountId, deploymentId): Promise<AlFimConfiguration[]> {
        if (pathType === 'monitored_paths') {
            return Promise.resolve(monitoredConfigs);
        } else {
            return Promise.resolve(excludedConfigs);
        }
    }
}
