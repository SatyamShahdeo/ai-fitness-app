// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }) {
    try {
      // Find the authenticated role
      const authenticatedRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'authenticated' } });

      if (authenticatedRole) {
        // Enable update permission for users-permissions.user.update
        // In Strapi v4/v5, permissions are stored in the plugin::users-permissions.permission table
        // and its existence (linked to the role) dictates if it's enabled.
        const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
          where: {
            role: authenticatedRole.id,
            action: 'plugin::users-permissions.user.update',
          }
        });

        if (!existingPermission) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              role: authenticatedRole.id,
              action: 'plugin::users-permissions.user.update',
            }
          });
          strapi.log.info('Successfully created update permission for authenticated role');
        } else {
          strapi.log.info('Update permission for authenticated role already exists');
        }
      }
    } catch (error) {
      console.error('Error in bootstrap setting permissions:', error);
    }
  },
};
