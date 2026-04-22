const service = require('./questions.service');

const getAll     = async (req, res) => res.json(await service.findAll(req.query));
const getOne     = async (req, res) => res.json(await service.findById(req.params.id));
const searchQ    = async (req, res) => res.json(await service.search(req.query));
const duplicates = async (req, res) => res.json(await service.checkDuplicates(req.query.titre));
const create     = async (req, res) => res.status(201).json(await service.create({ auteur_id: req.user.id, ...req.body }));
const update     = async (req, res) => res.json(await service.update(req.params.id, req.body));
const remove     = async (req, res) => { await service.remove(req.params.id); res.status(204).end(); };

module.exports = { getAll, getOne, searchQ, duplicates, create, update, remove };
