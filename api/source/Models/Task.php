<?php

namespace Source\Models;

use Source\Core\Model;

class Task extends Model
{
    private ?int $id;
    private ?int $userId;
    private ?string $title;
    private ?string $description;
    private ?string $priority;
    private ?string $dueDate;
    private ?int $statusId;
    private ?int $active;

    public function __construct(
        ?int $id = null,
        ?int $userId = null,
        ?string $title = null,
        ?string $description = null,
        ?string $priority = "Média",
        ?string $dueDate = null,
        ?int $statusId = 1,
        ?int $active = 1
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->title = $title;
        $this->description = $description;
        $this->priority = $priority ?? "Média";
        $this->dueDate = $dueDate;
        $this->statusId = $statusId ?? 1;
        $this->active = $active ?? 1;

        $this->table = 'tasks';
        $this->primaryKey = 'id';
        $this->fillable = ['userId', 'title', 'description', 'priority', 'dueDate', 'statusId', 'active'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function setUserId(int $userId): void
    {
        $this->userId = $userId;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function getPriority(): ?string
    {
        return $this->priority;
    }

    public function setPriority(string $priority): void
    {
        $this->priority = $priority;
    }

    public function getDueDate(): ?string
    {
        return $this->dueDate;
    }

    public function setDueDate(?string $dueDate): void
    {
        $this->dueDate = $dueDate;
    }

    public function getStatusId(): ?int
    {
        return $this->statusId;
    }

    public function setStatusId(int $statusId): void
    {
        $this->statusId = $statusId;
    }

    public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(int $active): void
    {
        $this->active = $active;
    }
}
