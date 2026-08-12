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
        const requiredPermissions = [
          'plugin::users-permissions.user.update',
          'api::food-log.food-log.find',
          'api::food-log.food-log.create',
          'api::food-log.food-log.delete',
          'api::activity-log.activity-log.find',
          'api::activity-log.activity-log.create',
          'api::activity-log.activity-log.delete',
          'api::image-analysis.image-analysis.analyze',
        ];

        for (const action of requiredPermissions) {
          const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: {
              role: authenticatedRole.id,
              action,
            }
          });

          if (!existingPermission) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                role: authenticatedRole.id,
                action,
              }
            });
            strapi.log.info(`Successfully created permission: ${action}`);
          }
        }
      }
    } catch (error) {
      console.error('Error in bootstrap setting permissions:', error);
    }
  },
};
