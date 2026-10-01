import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M01_I18N_KEY } from "../../i18n/m01/core.js";

export const M01_LEGACY_CONTENT = (): string => Localization.t(M01_I18N_KEY.DEVICE_LEGACY_CONTENT);
export const M01_BLACKWIRE_GATEWAY_CONTENT = (): string =>
    Localization.t(M01_I18N_KEY.DEVICE_BLACKWIRE_GATEWAY_CONTENT);
export const M01_FROSTGATE_GATEWAY_CONTENT = (): string =>
    Localization.t(M01_I18N_KEY.DEVICE_FROSTGATE_GATEWAY_CONTENT);
export const M01_FROSTGATE_API_CONTENT = (): string =>
    Localization.t(M01_I18N_KEY.DEVICE_FROSTGATE_API_CONTENT);
export const M01_OBSIDIAN_GATEWAY_CONTENT = (): string =>
    Localization.t(M01_I18N_KEY.DEVICE_OBSIDIAN_GATEWAY_CONTENT);
export const M01_OBSIDIAN_API_CONTENT = (): string =>
    Localization.t(M01_I18N_KEY.DEVICE_OBSIDIAN_API_CONTENT);

export const M01_KIMAI_SCRIPT_NAME = "kimai";
export const M01_JWT_DECODER_SCRIPT_NAME = "jwt_decoder";

export const M01_LEDGER_FILE_NAME = "sales_ledger";
export const M01_LEDGER_FILE_EXTENSION = "log";
export const M01_BUYER_ALIAS = "TR4C3#404";
export const buildM01LedgerContent = (listingCode: string): string =>
    Localization.t(M01_I18N_KEY.LEDGER_CONTENT, { listingCode, buyer: M01_BUYER_ALIAS });

export const M01_OPS_NOTES_FILE_NAME = "ops_notes";
export const M01_OPS_NOTES_FILE_EXTENSION = "txt";
export const M01_OPS_NOTES_CONTENT = (): string => Localization.t(M01_I18N_KEY.DEVICE_OPS_NOTES_CONTENT);

export const M01_DUMMY_TODO_CONTENT = (): string => Localization.t(M01_I18N_KEY.DEVICE_DUMMY_TODO);
export const M01_DUMMY_README_CONTENT = (): string => Localization.t(M01_I18N_KEY.DEVICE_DUMMY_README);
export const M01_DUMMY_AUTH_LOG_CONTENT = [
    "Sep 09 03:14:02 be7 sshd[10231]: Failed password for invalid user test from 103.42.88.19 port 51102 ssh2",
    "Sep 09 03:14:06 be7 sshd[10231]: Failed password for invalid user test from 103.42.88.19 port 51102 ssh2",
    "Sep 09 03:14:09 be7 sshd[10231]: Connection closed by authenticating user test 103.42.88.19 port 51102 [preauth]",
    "Sep 09 07:41:55 be7 sshd[10305]: Failed password for invalid user admin from 91.203.44.12 port 44210 ssh2",
    "Sep 09 07:41:59 be7 sshd[10305]: Failed password for invalid user admin from 91.203.44.12 port 44210 ssh2",
    "Sep 09 07:42:03 be7 sshd[10305]: Received disconnect from 91.203.44.12 port 44210:11: [preauth]",
    "Sep 11 22:03:17 be7 sshd[11840]: Failed password for root from 185.220.101.3 port 39960 ssh2",
    "Sep 11 22:03:21 be7 sshd[11840]: Failed password for root from 185.220.101.3 port 39960 ssh2",
    "Sep 11 22:03:25 be7 sshd[11840]: Failed password for root from 185.220.101.3 port 39960 ssh2",
    "Sep 11 22:03:30 be7 sshd[11840]: Disconnecting authenticating user root 185.220.101.3 port 39960: Too many authentication failures [preauth]",
    "Sep 14 09:12:41 be7 sshd[13022]: Accepted password for opsadmin from 10.0.0.4 port 52011 ssh2",
    "Sep 14 09:12:41 be7 sshd[13022]: pam_unix(sshd:session): session opened for user opsadmin by (uid=0)",
    "Sep 14 09:18:03 be7 sshd[13022]: pam_unix(sshd:session): session closed for user opsadmin",
    "Sep 16 14:55:12 be7 sshd[14501]: Accepted password for X7xS3NTRY9 from 94.101.33.187 port 60214 ssh2",
    "Sep 16 14:55:12 be7 sshd[14501]: pam_unix(sshd:session): session opened for user X7xS3NTRY9 by (uid=0)",
    "Sep 16 14:57:38 be7 sudo: X7xS3NTRY9 : TTY=pts/0 ; PWD=/home/X7xS3NTRY9 ; USER=root ; COMMAND=/usr/sbin/service nginx restart",
    "Sep 16 15:20:09 be7 sshd[14501]: pam_unix(sshd:session): session closed for user X7xS3NTRY9",
    "Sep 18 02:47:30 be7 sshd[15690]: Failed password for invalid user oracle from 209.141.56.78 port 49188 ssh2",
    "Sep 18 02:47:34 be7 sshd[15690]: Connection closed by authenticating user oracle 209.141.56.78 port 49188 [preauth]",
].join("\n");
export const M01_DUMMY_CRON_LOG_CONTENT = [
    "Sep 09 00:00:01 be7 CRON[8821]: (root) CMD (/usr/local/bin/backup.sh)",
    "Sep 09 03:00:01 be7 CRON[8830]: (root) CMD (/usr/local/bin/cert-renew.sh)",
    "Sep 09 04:00:01 be7 CRON[8842]: (root) CMD (/usr/local/bin/vault-sync.sh)",
    "Sep 09 06:25:01 be7 CRON[8850]: (root) CMD (test -x /etc/cron.daily/logrotate && /etc/cron.daily/logrotate)",
    "Sep 10 00:00:01 be7 CRON[9012]: (root) CMD (/usr/local/bin/backup.sh)",
    "Sep 10 03:00:01 be7 CRON[9021]: (root) CMD (/usr/local/bin/cert-renew.sh)",
    "Sep 10 04:00:01 be7 CRON[9034]: (root) CMD (/usr/local/bin/vault-sync.sh)",
    "Sep 11 00:00:01 be7 CRON[9615]: (root) CMD (/usr/local/bin/backup.sh)",
    "Sep 11 03:00:01 be7 CRON[9624]: (root) CMD (/usr/local/bin/cert-renew.sh)",
    "Sep 11 04:00:01 be7 CRON[9640]: (root) CMD (/usr/local/bin/vault-sync.sh)",
    "Sep 12 00:00:01 be7 CRON[10203]: (root) CMD (/usr/local/bin/backup.sh)",
    "Sep 12 03:00:01 be7 CRON[10211]: (root) CMD (/usr/local/bin/cert-renew.sh)",
    "Sep 12 04:00:02 be7 CRON[10228]: (root) CMD (/usr/local/bin/vault-sync.sh)",
    "Sep 13 00:00:01 be7 CRON[10802]: (root) CMD (/usr/local/bin/backup.sh)",
    "Sep 13 03:00:01 be7 CRON[10811]: (root) CMD (/usr/local/bin/cert-renew.sh)",
].join("\n");
export const M01_DUMMY_SYSTEM_LOG_CONTENT = [
    "Sep 09 04:17:02 be7 kernel: [041502.912004] EXT4-fs (sda1): re-mounted. Opts: (null)",
    "Sep 09 08:02:15 be7 systemd[1]: Starting Daily apt download activities...",
    "Sep 09 08:02:41 be7 systemd[1]: Finished Daily apt download activities.",
    "Sep 10 12:40:02 be7 systemd[1]: Reloading nginx.service - A high performance web server...",
    "Sep 10 12:40:03 be7 nginx[2211]: nginx: configuration file /etc/nginx/nginx.conf test is successful",
    "Sep 10 12:40:03 be7 systemd[1]: Reloaded nginx.service - A high performance web server.",
    "Sep 12 03:00:19 be7 systemd-logind[812]: New session 4021 of user opsadmin.",
    "Sep 14 09:12:44 be7 systemd-logind[812]: New session 4188 of user opsadmin.",
    "Sep 17 22:14:55 be7 kernel: [128841.552310] TCP: request_sock_TCP: Possible SYN flooding on port 22. Sending cookies.",
    "Sep 18 02:47:31 be7 kernel: [131022.114857] audit: type=1400 audit(1758169650.512:88): apparmor=\"DENIED\" operation=\"open\" profile=\"sshd\" name=\"/etc/shadow\" pid=15690",
].join("\n");
