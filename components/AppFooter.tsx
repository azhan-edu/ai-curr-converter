'use client'

import { useEffect, useState } from 'react'

export default function AppFooter() {
  return (
    <footer className="text-center text-sm text-gray-500 py-4 px-4">
      &copy; {(new Date().getFullYear())} GoWell Technologies. All rights reserved.
    </footer>
  )
}