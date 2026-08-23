data "aws_ami" "ubuntu" {
  most_recent = true

  owners = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_vpc" "bookhaven_vpc" {
  cidr_block = var.vpc_cidr

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_internet_gateway" "bookhaven_igw" {
  vpc_id = aws_vpc.bookhaven_vpc.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

resource "aws_subnet" "bookhaven_public_subnet" {
  vpc_id                  = aws_vpc.bookhaven_vpc.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = var.availability_zone
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet"
  }
}

resource "aws_route_table" "bookhaven_public_route_table" {
  vpc_id = aws_vpc.bookhaven_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.bookhaven_igw.id
  }

  tags = {
    Name = "${var.project_name}-public-route-table"
  }
}

resource "aws_route_table_association" "bookhaven_public_route_association" {
  subnet_id      = aws_subnet.bookhaven_public_subnet.id
  route_table_id = aws_route_table.bookhaven_public_route_table.id
}

resource "aws_security_group" "bookhaven_kubernetes_sg" {
  name        = "${var.project_name}-kubernetes-sg"
  description = "Security group for the BookHaven Kubernetes node"
  vpc_id      = aws_vpc.bookhaven_vpc.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "BookHaven backend"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

    ingress {
    description = "BookHaven frontend"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Kubernetes API server"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-kubernetes-sg"
  }
}

resource "aws_instance" "bookhaven_kubernetes_node" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.bookhaven_public_subnet.id
  vpc_security_group_ids = [aws_security_group.bookhaven_kubernetes_sg.id]
  key_name               = var.key_name

  associate_public_ip_address = true

  tags = {
    Name = "${var.project_name}-kubernetes-node"
  }
}