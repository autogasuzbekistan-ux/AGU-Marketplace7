<?php

namespace App\Imports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProductsImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // Excel faylida 'name' va 'price' ustunlari bo'lishi shart
        if (!isset($row['name']) || !isset($row['price'])) {
            return null;
        }

        // Agar mahsulot nomi bo'yicha mavjud bo'lsa, yangilaymiz, aks holda yangi yaratamiz
        return Product::updateOrCreate(
            ['name' => $row['name']],
            [
                'price'       => (float) $row['price'],
                'description' => $row['description'] ?? 'Tavsif kiritilmagan',
                'category'    => $row['category'] ?? 'Boshqalar',
                'stock_status'=> isset($row['stock_status']) && in_array($row['stock_status'], ['in_stock', 'out_of_stock']) 
                                 ? $row['stock_status'] 
                                 : 'in_stock',
                'image_url'   => $row['image_url'] ?? null,
            ]
        );
    }
}