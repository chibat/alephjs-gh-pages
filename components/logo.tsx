import React from 'react'

export default function Logo({ size = 75 }: { size?: number }) {
  return (
    <img src="/alephjs-gh-pages/logo.svg" height={size} title="Aleph.js" />
  )
}
