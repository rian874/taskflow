<?php

namespace Source\Models;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class TaskImage extends Model
{
    private ?int $id;
    private ?int $taskId;
    private ?string $imagePath;
    private ?string $altText;
    private ?int $position;
    private ?string $createdAt;

    public function __construct(
        ?int $id = null,
        ?int $taskId = null,
        ?string $imagePath = null,
        ?string $altText = null,
        ?int $position = 0,
        ?string $createdAt = null
    ) {
        $this->id = $id;
        $this->taskId = $taskId;
        $this->imagePath = $imagePath;
        $this->altText = $altText;
        $this->position = $position ?? 0;
        $this->createdAt = $createdAt;

        $this->table = 'task_images';
        $this->primaryKey = 'id';
        $this->fillable = ['taskId', 'imagePath', 'altText', 'position'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getTaskId(): ?int
    {
        return $this->taskId;
    }

    public function setTaskId(?int $taskId): void
    {
        $this->taskId = $taskId;
    }

    public function getImagePath(): ?string
    {
        return $this->imagePath;
    }

    public function setImagePath(?string $imagePath): void
    {
        $this->imagePath = $imagePath;
    }

    public function getAltText(): ?string
    {
        return $this->altText;
    }

    public function setAltText(?string $altText): void
    {
        $this->altText = $altText;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(?int $position): void
    {
        $this->position = $position;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?string $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function selectByTaskId(int $taskId): array
    {
        try {
            $sql = "SELECT id, task_id, image_path, alt_text, position, created_at
                    FROM {$this->table}
                    WHERE task_id = :task_id
                    ORDER BY position ASC, id ASC";
            $stmt = Connect::getInstance()->prepare($sql);
            $stmt->bindValue(':task_id', $taskId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_OBJ) ?: [];
        } catch (PDOException $e) {
            $this->errorMessage = "Erro ao listar imagens da tarefa: {$e->getMessage()}";
            return [];
        }
    }

    public function selectByIdAndTask(int $imageId, int $taskId): ?object
    {
        try {
            $sql = "SELECT id, task_id, image_path, alt_text, position, created_at
                    FROM {$this->table}
                    WHERE id = :id AND task_id = :task_id
                    LIMIT 1";
            $stmt = Connect::getInstance()->prepare($sql);
            $stmt->bindValue(':id', $imageId, PDO::PARAM_INT);
            $stmt->bindValue(':task_id', $taskId, PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_OBJ);
            return $row ?: null;
        } catch (PDOException $e) {
            $this->errorMessage = "Erro ao buscar imagem: {$e->getMessage()}";
            return null;
        }
    }
}
