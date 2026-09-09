import * as migration_20260619_add_missing_locked_docs_columns from './20260619_add_missing_locked_docs_columns';
import * as migration_20260620_125822 from './20260620_125822';
import * as migration_20260620_links_profile from './20260620_links_profile';
import * as migration_20260620_drop_social_links from './20260620_drop_social_links';
import * as migration_20260620_drop_links_profile_correct from './20260620_drop_links_profile_correct';
import * as migration_20260620_fix_tenants_permissions from './20260620_fix_tenants_permissions';
import * as migration_20260620_profile_links from './20260620_profile_links';
import * as migration_20260620_content_network from './20260620_content_network';
import * as migration_20260908_remove_tenancy from './20260908_remove_tenancy';
import * as migration_20260908_work_grid_link_display from './20260908_work_grid_link_display';
import * as migration_20260909_add_site_global from './20260909_add_site_global';

export const migrations = [
  {
    up: migration_20260620_content_network.up,
    down: migration_20260620_content_network.down,
    name: '20260620_content_network'
  },
  {
    up: migration_20260908_remove_tenancy.up,
    down: migration_20260908_remove_tenancy.down,
    name: '20260908_remove_tenancy'
  },
  {
    up: migration_20260908_work_grid_link_display.up,
    down: migration_20260908_work_grid_link_display.down,
    name: '20260908_work_grid_link_display'
  },
  {
    up: migration_20260909_add_site_global.up,
    down: migration_20260909_add_site_global.down,
    name: '20260909_add_site_global'
  },
];
