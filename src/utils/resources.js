export const NONE = {};

export default function Resources(resources, accessors) {
  return {
    map(fn) {
      if (!resources) return [fn([NONE, null], 0)];
      return resources.map((resource, idx) => fn([accessors.resourceId(resource), resource], idx));
    },

    groupAppointments(appointments) {
      const appointmentsByResource = new Map();

      if (!resources) {
        // Return all appointments if resources are not provided
        appointmentsByResource.set(NONE, appointments);
        return appointmentsByResource;
      }

      appointments.forEach((appointment) => {
        const id = accessors.resource(appointment) || NONE;
        const resourceAppointments = appointmentsByResource.get(id) || [];
        resourceAppointments.push(appointment);
        appointmentsByResource.set(id, resourceAppointments);
      });
      return appointmentsByResource;
    },
  };
}
