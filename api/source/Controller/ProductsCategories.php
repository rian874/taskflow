<?php

namespace Source\Controller;

class ProductsCategories extends Api
{
    public function productsCategoryList(array $data): void
    {
        $this->call(200, "success", "Categorias de produtos", "success")->back([]);
    }
}
