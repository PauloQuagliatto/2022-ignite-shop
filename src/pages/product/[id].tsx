import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import axios from 'axios'
import Stripe from 'stripe'

import { stripe } from '../../lib/stripe'

import { ImageContainer, ProductContainer, ProductDetails } from '../../styles/pages/product'

interface ProductProps {
  product: {
    id: string
    name: string
    imageUrl: string
    price: string
    description: string
    defaultPriceId: string
  }
}

export default function Product({ product }: ProductProps) {
  const title = `${product.name} | Ignite Shop`
  const [isWaiting, setIsWaiting] = useState(false)

  async function handleBuyProduct() {
    setIsWaiting(true)
    try {
      const res = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId
      })

      const { checkoutUrl } = res.data

      window.location.href = checkoutUrl
    } catch (e) {
      alert('Deu não')
      setIsWaiting(false)
    }
  }
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} width={520} height={480} alt='' />
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>

          <p>{product.description}</p>

          <button
            disabled={isWaiting}
            onClick={handleBuyProduct}>
            Comprar Agora
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { id: 'prod_MtFLjyx83AFVuv' } }
    ],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
  const productId = params!.id
  const response = await stripe.products.retrieve(productId, {
    expand: ['default_price']
  })

  const price = response.default_price as Stripe.Price

  return {
    props: {
      product: {
        id: response.id,
        name: response.name,
        imageUrl: response.images[0],
        price: new Intl.NumberFormat('pt-br', {
          style: 'currency',
          currency: 'BRL'
        }).format(price.unit_amount! / 100),
        description: response.description,
        defaultPriceId: price.id
      }
    },
    revalidate: 60 * 60 * 1
  }
}
