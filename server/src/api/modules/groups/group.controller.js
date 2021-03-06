const service = require('./group.service');

async function listGroups(req, res, next) {
  try {
    const { name } = req.query;

    const results = await service.list(name);
    res.json(results);
  } catch (e) {
    next(e);
  }
}

async function viewGroup(req, res, next) {
  try {
    const { id } = req.params;

    const competition = await service.view(id);
    res.json(competition);
  } catch (e) {
    next(e);
  }
}

async function createGroup(req, res, next) {
  try {
    const { name, members } = req.body;

    const group = await service.create(name, members);
    res.status(201).json(group);
  } catch (e) {
    next(e);
  }
}

async function editGroup(req, res, next) {
  try {
    const { id } = req.params;
    const { name, verificationCode, members } = req.body;

    const group = await service.edit(id, name, verificationCode, members);
    res.json(group);
  } catch (e) {
    next(e);
  }
}

async function deleteGroup(req, res, next) {
  try {
    const { id } = req.params;
    const { verificationCode } = req.body;

    const groupName = await service.destroy(id, verificationCode);
    res.json({ message: `Successfully deleted group '${groupName}'. (id: ${id})` });
  } catch (e) {
    next(e);
  }
}

async function addMembers(req, res, next) {
  try {
    const { id } = req.params;
    const { verificationCode, players } = req.body;

    const result = await service.addMembers(id, verificationCode, players);
    res.json({ newMembers: result });
  } catch (e) {
    next(e);
  }
}

async function removeMembers(req, res, next) {
  try {
    const { id } = req.params;
    const { verificationCode, members } = req.body;

    const count = await service.removeMembers(id, verificationCode, members);
    res.json({ message: `Successfully removed ${count} members from group of id: ${id}` });
  } catch (e) {
    next(e);
  }
}

async function changeRole(req, res, next) {
  try {
    const { id } = req.params;
    const { username, role, verificationCode } = req.body;

    const result = await service.changeRole(id, username, role, verificationCode);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

exports.listGroups = listGroups;
exports.viewGroup = viewGroup;
exports.createGroup = createGroup;
exports.editGroup = editGroup;
exports.deleteGroup = deleteGroup;
exports.addMembers = addMembers;
exports.removeMembers = removeMembers;
exports.changeRole = changeRole;
