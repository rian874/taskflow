<?php

namespace Source\Controller;

class Products extends Api
{
    public function productsList(array $data): void
    {
        $this->call(200, "success", "Lista de produtos", "success")->back([]);
    }

    public function productsListById(array $data): void
    {
        $this->call(200, "success", "Produto", "success")->back([]);
    }

    public function create(array $data): void
    {
        $this->call(201, "created", "Produto criado", "success")->back([]);
    }
}
