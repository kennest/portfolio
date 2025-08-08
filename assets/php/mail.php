<?php

// TODO: Remplacer par votre adresse de réception
$to = 'oulai.davis.pro@gmail.com';

// Récupération sécurisée des champs
$name    = isset($_POST['name']) ? trim($_POST['name']) : '';
$email   = isset($_POST['email']) ? trim($_POST['email']) : '';
$subject = isset($_POST['subject']) ? trim($_POST['subject']) : '';
$msg     = isset($_POST['msg']) ? trim($_POST['msg']) : '';

if ($name === '' || $email === '' || $subject === '' || $msg === '') {
	http_response_code(400);
	exit('Missing required fields.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
	http_response_code(400);
	exit('Invalid email.');
}

$headers = 'From: '.$name.' <'.$email.'>' . "\r\n" . 'Reply-To: '.$email;
$output  = "Name: {$name}\nEmail: {$email}\nSubject: {$subject}\n\nMessage:\n{$msg}";

$sent = mail($to, $subject, $output, $headers);
echo $sent ? 'OK' : 'FAILED';