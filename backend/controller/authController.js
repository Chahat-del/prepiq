const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const register = async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields required' })

  try {
    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing)
      return res.status(400).json({ error: 'Email already registered' })

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword }])
      .select()
      .single()

    if (error) throw error

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ error: 'All fields required' })

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user)
      return res.status(400).json({ error: 'Invalid email or password' })

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword)
      return res.status(400).json({ error: 'Invalid email or password' })

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { register, login }