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
        await strapi.query('plugin::users-permissions.permission').updateMany({
          where: {
            role: authenticatedRole.id,
            action: 'plugin::users-permissions.user.update',
          },
          data: {
            enabled: true,
          },
        });
      }
    } catch (error) {
      console.error('Error in bootstrap setting permissions:', error);
    }
  },
};
