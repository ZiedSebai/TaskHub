const { Router } = require('express');
const { supabase } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name,
        description,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { data: projectMembers, error } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', req.user.id);

    if (error) throw error;

    const projectIds = projectMembers.map(pm => pm.project_id);

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds);

    if (projectsError) throw projectsError;

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/board', requireAuth, async (req, res) => {
  try {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { data: isMember } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:users!tasks_assigned_to_fkey(id, name, email)
      `)
      .eq('project_id', req.params.id)
      .order('order', { ascending: true });

    if (tasksError) throw tasksError;

    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select(`
        user_id,
        role,
        user:users(id, name, email)
      `)
      .eq('project_id', req.params.id);

    if (membersError) throw membersError;

    const columns = ['Backlog', 'In Progress', 'Review', 'Done'];

    res.json({
      name: project.name,
      columns,
      tasks: tasks || [],
      members: members.map(m => ({
        userId: m.user_id,
        role: m.role,
        user: m.user
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/members', requireAuth, async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;

    const { data: membership, error: membershipError } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (membershipError) throw membershipError;

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ message: 'Only project owners and admins can add members' });
    }

    const { data: newMember, error } = await supabase
      .from('project_members')
      .insert({
        project_id: req.params.id,
        user_id: userId,
        role
      })
      .select(`
        user_id,
        role,
        user:users(id, name, email)
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ message: 'User is already a member of this project' });
      }
      throw error;
    }

    res.status(201).json({
      userId: newMember.user_id,
      role: newMember.role,
      user: newMember.user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id/members/:userId', requireAuth, async (req, res) => {
  try {
    const { data: membership, error: membershipError } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (membershipError) throw membershipError;

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ message: 'Only project owners and admins can remove members' });
    }

    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', req.params.id)
      .eq('user_id', req.params.userId);

    if (error) throw error;

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
