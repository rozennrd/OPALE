import { Request, Response } from 'express';
import { eventService } from '../../domain/services/eventService';
import { EventDTO } from '../../domain/dto/eventDto';

function validateEventDto(req: Request, res: Response): EventDTO | null {
  const {
    type,
    nom,
    description,
    num_semaine,
    datetime_start,
    datetime_end,
    show_macro,
    show_micro,
    is_blocking,
    is_exceptional,
    is_external,
    concerne,
  } = req.body;

  if (!type || !nom || !datetime_start || !datetime_end) {
    res.status(400).json({
      error:
        'Les champs type, nom, datetime_start et datetime_end sont obligatoires.',
    });
    return null;
  }

  const validTypes = [
    'Cours',
    'Entreprise',
    'Examen',
    'Reunion',
    'Fermeture',
    'Soutenance',
    'JPO',
    'Stage',
    'Mobilite',
    'PFE',
    'Rattrapage',
    'Conference',
    'Rentrée',
    'Réunion parents',
    'Journée Immersion',
    'Concours',
    'Salon',
    'Fin des cours',
    'Autre',
  ];
  if (!validTypes.includes(type)) {
    res.status(400).json({
      error: `Le type doit être parmi: ${validTypes.join(', ')}`,
    });
    return null;
  }

  return {
    type,
    nom,
    description,
    num_semaine: num_semaine || undefined,
    datetime_start: new Date(datetime_start),
    datetime_end: new Date(datetime_end),
    show_macro: show_macro ?? true,
    show_micro: show_micro ?? true,
    is_blocking: is_blocking ?? false,
    is_exceptional: is_exceptional ?? false,
    is_external: is_external ?? false,
    concerne,
  };
}

export const eventController = {
  async getAllEvents(req: Request, res: Response): Promise<void> {
    try {
      const events = await eventService.getAllEvents();
      res.json(events);
    } catch (err: any) {
      console.error('Error in getAllEvents:', err);
      res.status(500).json({ error: err.message });
    }
  },

  async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const event = await eventService.getEventById(id);
      res.json(event);
    } catch (err: any) {
      console.error('Error in getEventById:', err);
      if (err.message.includes('non trouvé')) {
        res.status(404).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  },

  async getExceptionalEvents(req: Request, res: Response): Promise<void> {
    try {
      const events = await eventService.getExceptionalEvents();
      res.json(events);
    } catch (err: any) {
      console.error('Error in getExceptionalEvents:', err);
      res.status(500).json({ error: err.message });
    }
  },

  async getEventsMacro(req: Request, res: Response): Promise<void> {
    try {
      const events = await eventService.getMacroEvents();
      res.json(events);
    } catch (err: any) {
      console.error('Error in getEventsMacro:', err);
      res.status(500).json({ error: err.message });
    }
  },

  async getEventsByPromoAndTypes(req: Request, res: Response): Promise<void> {
    try {
      const { idPromo, types } = req.body;

      if (!idPromo || !Array.isArray(types) || types.length === 0) {
        res.status(400).json({
          message: "Les champs 'idPromo' et 'types[]' sont obligatoires.",
        });
        return;
      }
      const events = await eventService.getEventsByPromoAndTypes(idPromo, types);

      const nothingFound = Object.values(events).every(
        (list) => list.length === 0,
      );

      if (nothingFound) {
        res.status(404).json({
          message: `Aucun évènement trouvé pour la promo ${idPromo}.`,
        });
        return;
      }

      res.json(events);
    } catch (err: any) {
      console.error('Error in getEventsByPromoAndTypes:', err);
      res.status(500).json({ error: err.message });
    }
  },

  async addEvent(req: Request, res: Response): Promise<void> {
    try {
      const dto = validateEventDto(req, res);
      if (!dto) return;

      const result = await eventService.createEvent(dto);

      res.status(201).json({
        success: true,
        message: 'Événement ajouté avec succès',
        insertedId: result.id,
      });
    } catch (err: any) {
      console.error('Error addEvent:', err);

      if (err.message.includes('date de début')) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  },

  async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = validateEventDto(req, res);
      if (!dto) return;

      if (!id) {
        res
          .status(400)
          .json({ error: "L'ID de l'événement est requis dans le body." });
        return;
      }

      dto.id = id;

      await eventService.updateEvent(dto);

      res.status(200).json({
        success: true,
        message: 'Événement modifié avec succès',
      });
    } catch (err: any) {
      console.error('Error updateEvent:', err);

      if (err.message.includes('non trouvé')) {
        res.status(404).json({ error: err.message });
      } else if (err.message.includes('date de début')) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  },

  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: "ID de l'événement est requis." });
        return;
      }

      await eventService.deleteEvent(id);
      res.status(200).json({
        success: true,
        message: 'Événement supprimé avec succès.',
      });
    } catch (err: any) {
      console.error('Error deleteEvent:', err);

      if (err.message.includes('non trouvé')) {
        res.status(404).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  },
};
