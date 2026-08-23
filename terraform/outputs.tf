output "kubernetes_node_public_ip" {
  description = "Public IP address of the BookHaven Kubernetes node"
  value       = aws_instance.bookhaven_kubernetes_node.public_ip
}