const { emitToProject } = require('../sockets');

const notifyProject = (projectId, payload) => {
  emitToProject(projectId, 'project_event', payload);
};

module.exports = { notifyProject };