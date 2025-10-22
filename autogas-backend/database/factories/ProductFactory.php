<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => ucfirst(fake()->words(3, true)),
            'price' => fake()->randomFloat(2, 10, 999),
            'category' => fake()->randomElement([
                'Gaz Ballonlari', 
                'Reduktorlar', 
                'Filtrlar', 
                'Qo\'shimcha Jihozlar', 
                'Ehtiyot Qismlar'
            ]),
            'description' => fake()->paragraph(2),
            'imageUrl' => 'https://via.placeholder.com/400x300/0B3373/FFFFFF?text=Product',
            'stockStatus' => fake()->randomElement(['in_stock', 'out_of_stock', 'low_stock']),
        ];
    }

    /**
     * Stokda mavjud mahsulot
     */
    public function inStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stockStatus' => 'in_stock',
        ]);
    }

    /**
     * Stokda yo'q mahsulot
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stockStatus' => 'out_of_stock',
        ]);
    }

    /**
     * Kam qolgan mahsulot
     */
    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stockStatus' => 'low_stock',
        ]);
    }
}