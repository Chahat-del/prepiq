require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://kogyeyicqqlwgvxjdbvf.supabase.co',
  'sb_publishable_UEpApqjOzSTd6eCuvi7lAA_gzf-f6wo'
)

const getSubjects = async (req, res) => {
  const userId = req.user.id
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ subjects: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const createSubject = async (req, res) => {
  const userId = req.user.id
  const { name, exam, color } = req.body

  if (!name || !exam)
    return res.status(400).json({ error: 'Name and exam are required' })

  try {
    const { data, error } = await supabase
      .from('subjects')
      .insert([{ user_id: userId, name, exam, color: color || '#5DCAA5' }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ subject: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getSubjectById = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    const { data: subject, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error

    const { data: topics } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', id)
      .order('created_at', { ascending: true })

    res.json({ subject, topics: topics || [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateTopic = async (req, res) => {
  const { topicId } = req.params
  const { done } = req.body

  try {
    const { data, error } = await supabase
      .from('topics')
      .update({ done })
      .eq('id', topicId)
      .select()
      .single()

    if (error) throw error
    res.json({ topic: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteSubject = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    // Delete related records manually to handle cases where ON DELETE CASCADE is missing
    await supabase.from('topics').delete().eq('subject_id', id)
    await supabase.from('mock_results').delete().eq('subject_id', id)
    await supabase.from('pyq_papers').delete().eq('subject_id', id)

    const { data, error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
    res.json({ message: 'Subject deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getSubjects, createSubject, getSubjectById, updateTopic, deleteSubject }